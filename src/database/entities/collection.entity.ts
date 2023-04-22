import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import {
  ADDRESS_LENGTH,
  MAX_BIO_LENGTH,
} from '../../shared/constants/user.constants';
import { TokenType } from '../../shared/enums/base.enum';
import { NftEntity } from './nft.entity';
import { UserEntity } from './user.entity';

@Entity('collections')
@Unique('collection_constraint', ['address'])
export class CollectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: ADDRESS_LENGTH })
  address: string;

  @ManyToOne(() => UserEntity, (user) => user.address, { nullable: true })
  creator: UserEntity;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  symbol: string;

  @Column({ nullable: true, length: MAX_BIO_LENGTH })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column()
  type: TokenType;

  @Column({ nullable: true, default: 0 })
  volume: number;

  @Column({ nullable: true, default: 0 })
  royalty: number;

  @Column({ default: false })
  verified: boolean;

  @OneToMany(() => NftEntity, (nft) => nft.collection)
  nfts: NftEntity[];

  @ManyToMany(() => UserEntity, (user) => user.likedCollections)
  likedByUsers: UserEntity[];
}
