import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CollectionEntity,
  NftEntity,
  TransactionEntity,
  UserEntity,
} from '../database/entities';
import { LoggerService } from '../shared/services/logger/logger.service';
import { firstValueFrom } from 'rxjs';
import { SCAN_URL } from '../shared/constants/config.constant';
import { HttpService } from '@nestjs/axios';
import { Config, ConfigService } from '../config/config.service';
import { ethers } from 'ethers';
import { EventType } from '../shared/enums/base.enum';
import { TOPIC } from '../shared/abi';

@Injectable()
export class NftStoreService {
  private config: Config;
  constructor(
    @InjectRepository(NftEntity)
    private nftRepository: Repository<NftEntity>,
    @InjectRepository(CollectionEntity)
    private collectionRepository: Repository<CollectionEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private http: HttpService,
  ) {
    this.config = this.configService.getConfig();
  }
  async saveTxHistory(
    txData: TransactionDataType[],
    metadataUrls: any,
  ): Promise<void> {
    if (!txData.length) return;
    try {
      let collection: CollectionEntity;
      let nft: NftEntity;
      for (const transaction of txData) {
        // find collection and save it if not exist
        collection = await this.collectionRepository.findOneBy({
          address: transaction.collectionAddress,
        });
        if (!collection) {
          collection = await this.collectionRepository.save({
            address: transaction.collectionAddress,
            type: transaction.tokenType,
          });
        }
        // find nft and update owner or save it if not exist
        const owner = await this.getUserByAddress(transaction.args[1]);
        await this.nftRepository.upsert(
          {
            collection,
            tokenId: transaction.args[2].toString(),
            owner,
            metadataUrl:
              metadataUrls[transaction.collectionAddress + transaction.args[2]]
                .callsReturnContext[0].returnValues,
          },
          ['collection', 'tokenId'],
        );
        nft = await this.nftRepository.findOneBy({
          collection,
          tokenId: transaction.args[2].toString(),
        });
        // Save transaction history
        const from = await this.getUserByAddress(transaction.args[0]);
        await this.transactionRepository.save({
          collection,
          nft,
          amount: 1,
          from,
          to: owner,
          eventType: transaction.eventType,
          tx: transaction.tx,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.timestamp,
        });
      }
      this.logger.info({
        message: 'Transaction history saved successfully',
        channel: NftStoreService.name,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed to save transaction history with error: ' + error,
        channel: NftStoreService.name,
      });
    }
  }

  async saveCollectionOwner(): Promise<void> {
    try {
      const collections = await this.collectionRepository
        .createQueryBuilder('collection')
        .where('collection.creatorId IS NULL')
        .select(['collection.id', 'collection.address', 'collection.type'])
        .getMany();
      for (const collection of collections) {
        const addressDetail = await this.fetchAddressDetail(collection.address);
        const creator = await this.getUserByAddress(
          addressDetail.data.contractCreateAddressHash,
        );
        if (addressDetail.message === 'successful') {
          collection.name = addressDetail.data.tokenName;
          collection.symbol = addressDetail.data.symbol;
          collection.creator = creator;
          collection.verified = addressDetail.data.verified;
        } else {
          throw new Error('Failed to fetch address detail from coredao scan');
        }
      }
      await this.collectionRepository.save(collections);
      this.logger.info({
        message: 'Collection creator and other infos saved successfully',
        channel: NftStoreService.name,
      });
    } catch (error) {
      this.logger.error({
        message: 'Failed collection update: ' + error,
        channel: NftStoreService.name,
      });
    }
  }

  async saveMarketplaceEvent(
    eventTopic: string,
    txEvent: ethers.utils.LogDescription,
    tx: string,
    blockNumber: number,
    timestamp: number,
  ): Promise<void> {
    let collectionAddress: string,
      tokenId: string,
      price: string,
      isListed: boolean,
      eventType: EventType,
      from: UserEntity,
      to: UserEntity;
    try {
      if (eventTopic === TOPIC[EventType.ITEM_LISTED]) {
        collectionAddress = txEvent.args[1];
        tokenId = txEvent.args[2].toString();
        price = txEvent.args[3].toString();
        eventType = EventType.ITEM_LISTED;
        from = await this.getUserByAddress(txEvent.args[0]);
        isListed = true;
      } else if (eventTopic === TOPIC[EventType.ITEM_BOUGHT]) {
        collectionAddress = txEvent.args[2];
        tokenId = txEvent.args[3].toString();
        price = txEvent.args[4].toString();
        eventType = EventType.ITEM_BOUGHT;
        from = await this.getUserByAddress(txEvent.args[1]);
        to = await this.getUserByAddress(txEvent.args[0]);
        isListed = false;
      } else {
        collectionAddress = txEvent.args[1];
        tokenId = txEvent.args[2].toString();
        price = '0';
        eventType = EventType.ITEM_CANCELED;
        from = await this.getUserByAddress(txEvent.args[0]);
        isListed = false;
      }
      // find collection
      const collection = await this.collectionRepository.findOneBy({
        address: collectionAddress,
      });
      if ((eventType = EventType.ITEM_BOUGHT)) {
        collection.volume += Number(price);
        await this.collectionRepository.save(collection);
      }
      // update nft
      const nft = await this.nftRepository.findOneBy({
        collection,
        tokenId,
      });
      nft.price = price;
      nft.isListed = isListed;
      await this.nftRepository.save(nft);
      // Save transaction history
      await this.transactionRepository.save({
        collection,
        nft,
        amount: 1,
        from,
        to,
        eventType,
        tx,
        blockNumber,
        timestamp,
      });
    } catch (error: any) {
      this.logger.error({
        message: `Failed to save ${eventType} events with error: + ${error}`,
        channel: NftStoreService.name,
      });
    }
  }

  async getStartBlockNumber(): Promise<number> {
    try {
      const lastSavedData = await this.transactionRepository
        .createQueryBuilder('transaction')
        .orderBy('transaction.blockNumber', 'DESC')
        .getOne();
      return lastSavedData.blockNumber;
    } catch (error) {
      this.logger.error({
        message: 'Failed to get last updated blockNumber with error: ' + error,
        channel: NftStoreService.name,
      });
    }
  }

  private async fetchAddressDetail(
    addressHash: string,
  ): Promise<AddressDetailType> {
    const { data } = await firstValueFrom(
      this.http.post<AddressDetailType>(
        `${SCAN_URL[this.config.NODE_ENV]}/api/chain/address_detail`,
        {
          addressHash,
        },
      ),
    );

    return data;
  }

  private async getUserByAddress(address: string): Promise<UserEntity> {
    let user = await this.userRepository.findOneBy({ address });
    if (!user) {
      user = await this.userRepository.save({ address });
    }
    return user;
  }
}
