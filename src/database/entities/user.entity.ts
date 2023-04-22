import { ApiHideProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  ADDRESS_LENGTH,
  MAX_BIO_LENGTH,
  MAX_NAME_LENGTH,
} from '../../shared/constants/user.constants';
import { CollectionEntity } from './collection.entity';
import { NftEntity } from './nft.entity';

@Entity('users')
@Unique('user_constraint', ['address'])
export class UserEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ unique: true, nullable: false, length: ADDRESS_LENGTH })
  address: string;

  @Expose()
  @Column({ nullable: true })
  email: string;

  @Expose()
  @Column({ nullable: true, length: MAX_NAME_LENGTH })
  name: string;

  @Expose()
  @Column({ nullable: true, length: MAX_BIO_LENGTH })
  bio: string;

  @Expose()
  @Column({ nullable: true })
  profileImage: string;

  @Expose()
  @Column({ nullable: true })
  bannerImage: string;

  @Expose()
  @ManyToMany(() => CollectionEntity, (collection) => collection.likedByUsers)
  @JoinTable()
  likedCollections: CollectionEntity;

  @Expose()
  @ManyToMany(() => NftEntity, (nft) => nft.likedByUsers)
  @JoinTable()
  likedNFTs: NftEntity[];

  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
