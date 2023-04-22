import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CollectionEntity } from './collection.entity';
import { UserEntity } from './user.entity';

@Entity('nfts')
@Unique('nft_constraint', ['collection', 'tokenId'])
export class NftEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CollectionEntity, (collection) => collection.nfts)
  collection: CollectionEntity;

  @Column()
  tokenId: string;

  @Column({ nullable: true })
  price: string;

  @ManyToOne(() => UserEntity, (user) => user.address)
  owner: UserEntity;

  @Column({ nullable: true })
  metadataUrl: string;

  @Column({ nullable: true, default: false })
  isListed: boolean;

  @ManyToMany(() => UserEntity, (user) => user.likedNFTs)
  likedByUsers: UserEntity[];
}
