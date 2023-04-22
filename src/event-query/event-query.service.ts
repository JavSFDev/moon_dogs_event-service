import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Config, ConfigService } from '../config/config.service';
import { NftStoreService } from '../nft-store/nft-store.service';
import { ABI, ERC721ABI, TOPIC } from '../shared/abi';
import { BLOCK_FILTER_LIMIT } from '../shared/constants/base.constant';
import {
  MARKETPLACE_START_BLOCK_NUMBER,
  MARKET_CONTRACT_ADDRESS,
  MULTICALL_ADDRESS,
  RPC_URL,
  START_BLOCK_NUMBER,
} from '../shared/constants/config.constant';
import { EventType, TokenType } from '../shared/enums/base.enum';
import { LoggerService } from '../shared/services/logger/logger.service';
import { Multicall } from 'ethereum-multicall';
import { retryRPCPromise } from '../utils';

@Injectable()
export class EventQueryService {
  private startBlockNumber: number;
  private provider1: ethers.providers.JsonRpcProvider;
  private provider2: ethers.providers.JsonRpcProvider;
  private config: Config;
  private multicall: Multicall;

  constructor(
    private readonly nftStoreService: NftStoreService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.config = this.configService.getConfig();
    this.provider1 = new ethers.providers.JsonRpcProvider(
      "https://rpc.coredao.org",
    );
    this.provider2 = new ethers.providers.JsonRpcProvider(
      "https://rpc.coredao.org",
    );
    this.multicall = new Multicall({
      ethersProvider: this.provider2,
      multicallCustomContractAddress: MULTICALL_ADDRESS[this.config.NODE_ENV],
      tryAggregate: true,
    });
    this.queryEvents();
  }

  private queryEvents = async () => {
    this.startBlockNumber =
      (await this.nftStoreService.getStartBlockNumber()) + 1 ||
      START_BLOCK_NUMBER[this.config.NODE_ENV];
    this.provider1.removeAllListeners('block');
    await this.getAllTxs();
  };

  private getAllTxs = async () => {
    this.provider1.removeAllListeners('block');
    const lastBlockNumber = await this.provider1.getBlockNumber();

    let fromBlockNumber: number = this.startBlockNumber;

    while (lastBlockNumber >= fromBlockNumber) {
      const toBlockNumber =
        lastBlockNumber > fromBlockNumber + BLOCK_FILTER_LIMIT
          ? fromBlockNumber + BLOCK_FILTER_LIMIT
          : lastBlockNumber;

      await this.filterAllTransferEvents(fromBlockNumber, toBlockNumber);
      if (
        MARKETPLACE_START_BLOCK_NUMBER[this.config.NODE_ENV] <= fromBlockNumber
      ) {
        await this.filterMarketplaceContractEvents(
          fromBlockNumber,
          toBlockNumber,
        );
      }
      this.logger.info({
        message: `Block filtered from ${fromBlockNumber} to ${toBlockNumber}`,
        channel: EventQueryService.name,
      });
      fromBlockNumber += BLOCK_FILTER_LIMIT;
    }
    this.startBlockNumber = lastBlockNumber + 1;
    this.provider1.on('block', this.getAllTxs);
  };

  private async filterAllTransferEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    // Filter all transfer events and save
    const transferInterface = new ethers.utils.Interface([
      ABI[EventType.TRANSFER],
    ]);
    const contexts = [] as any;
    const getTransferLogs = () =>
      this.provider1.getLogs({
        fromBlock,
        toBlock,
        topics: [[TOPIC[EventType.TRANSFER]]],
      });
    const logs: ethers.providers.Log[] = await retryRPCPromise(
      getTransferLogs,
      5,
    );
    this.logger.info({
      message: `Successfully fetched ${logs.length} Transferred events`,
      channel: EventQueryService.name,
    });
    const txData: TransactionDataType[] = [];
    for (const log of logs) {
      if (log.topics.length === 4) {
        const collectionAddress = log.address;
        const event = transferInterface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        const timestamp = (
          await this.provider2.getTransaction(log.transactionHash)
        ).timestamp;
        txData.push({
          collectionAddress,
          args: event.args,
          eventType: EventType.TRANSFER,
          tokenType: TokenType.ERC721,
          tx: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp,
        });
        contexts.push({
          reference: collectionAddress + event.args[2],
          contractAddress: collectionAddress,
          abi: ERC721ABI,
          calls: [
            {
              methodName: 'tokenURI',
              methodParameters: [event.args[2]],
            },
          ],
        });
      }
    }
    if (contexts.length) {
      let partialContextLength = 0;
      let metadataUrls = {};
      while (true) {
        const { results } = await this.multicall.call(
          contexts.slice(partialContextLength, partialContextLength + 200),
        );
        metadataUrls = Object.assign(results, metadataUrls);

        if (partialContextLength === contexts.length) break;
        if (partialContextLength + 200 >= contexts.length) {
          partialContextLength = contexts.length;
        } else {
          partialContextLength += 200;
        }
      }
      await this.nftStoreService.saveTxHistory(txData, metadataUrls);
      await this.nftStoreService.saveCollectionOwner();
    }
  }

  private async filterMarketplaceContractEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<void> {
    const itemListedInterface = new ethers.utils.Interface([
      ABI[EventType.ITEM_LISTED],
    ]);
    const itemCanceledInterface = new ethers.utils.Interface([
      ABI[EventType.ITEM_CANCELED],
    ]);
    const itemBoughtInterface = new ethers.utils.Interface([
      ABI[EventType.ITEM_BOUGHT],
    ]);
    // Filter Marketplace contract events
    const getMarketplaceEvents = () =>
      this.provider1.getLogs({
        address: MARKET_CONTRACT_ADDRESS[this.config.NODE_ENV],
        fromBlock,
        toBlock,
        topics: [
          [
            TOPIC[EventType.ITEM_BOUGHT],
            TOPIC[EventType.ITEM_LISTED],
            TOPIC[EventType.ITEM_CANCELED],
          ],
        ],
      });
    const logs: ethers.providers.Log[] = await retryRPCPromise(
      getMarketplaceEvents,
      5,
    );
    this.logger.info({
      message: `Successfully fetched ${logs.length} Marketplace contract events`,
      channel: EventQueryService.name,
    });

    for (const log of logs) {
      if (log.topics[0] === TOPIC[EventType.ITEM_LISTED]) {
        const event = itemListedInterface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        const timestamp = (
          await this.provider2.getTransaction(log.transactionHash)
        ).timestamp;
        await this.nftStoreService.saveMarketplaceEvent(
          log.topics[0],
          event,
          log.transactionHash,
          log.blockNumber,
          timestamp,
        );
      } else if (log.topics[0] === TOPIC[EventType.ITEM_BOUGHT]) {
        const event = itemBoughtInterface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        const timestamp = (
          await this.provider2.getTransaction(log.transactionHash)
        ).timestamp;
        await this.nftStoreService.saveMarketplaceEvent(
          log.topics[0],
          event,
          log.transactionHash,
          log.blockNumber,
          timestamp,
        );
      } else if (log.topics[0] === TOPIC[EventType.ITEM_CANCELED]) {
        const event = itemCanceledInterface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        const timestamp = (
          await this.provider2.getTransaction(log.transactionHash)
        ).timestamp;
        await this.nftStoreService.saveMarketplaceEvent(
          log.topics[0],
          event,
          log.transactionHash,
          log.blockNumber,
          timestamp,
        );
      }
    }
  }
}
