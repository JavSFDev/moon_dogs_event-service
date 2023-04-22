import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EventType } from '../../shared/enums/base.enum';
import { CollectionEntity } from './collection.entity';
import { NftEntity } from './nft.entity';
import { UserEntity } from './user.entity';

@Entity('transactions')
@Unique('transaction_constraint', ['id'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CollectionEntity)
  collection: CollectionEntity;

  @ManyToOne(() => NftEntity)
  nft: NftEntity;

  @Column({ default: 1 })
  amount: number;

  @ManyToOne(() => UserEntity, (user) => user.address, { nullable: true })
  from: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.address, { nullable: true })
  to: UserEntity;

  @Column()
  eventType: EventType;

  @Column()
  tx: string;

  @Column()
  blockNumber: number;

  @Column({ nullable: true })
  timestamp: number;
}
