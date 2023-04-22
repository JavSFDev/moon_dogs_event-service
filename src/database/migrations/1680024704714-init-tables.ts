import { MigrationInterface, QueryRunner } from 'typeorm';

export class initTables1680024704714 implements MigrationInterface {
  name = 'initTables1680024704714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying(42) NOT NULL, "email" character varying, "name" character varying(30), "bio" character varying(5000), "profileImage" character varying, "bannerImage" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c" UNIQUE ("address"), CONSTRAINT "user_constraint" UNIQUE ("address"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nfts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenId" character varying NOT NULL, "price" integer, "metadataUrl" character varying, "isListed" boolean DEFAULT false, "collectionId" uuid, "ownerId" uuid, CONSTRAINT "nft_constraint" UNIQUE ("collectionId", "tokenId"), CONSTRAINT "PK_65562dd9630b48c4d4710d66772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying(42) NOT NULL, "name" character varying, "symbol" character varying, "bio" character varying(5000), "profileImage" character varying, "bannerImage" character varying, "type" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "creatorId" uuid, CONSTRAINT "UQ_6a20f6af50eaccf584e5e2a9a6a" UNIQUE ("address"), CONSTRAINT "collection_constraint" UNIQUE ("address"), CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL DEFAULT '1', "eventType" character varying NOT NULL, "tx" character varying NOT NULL, "blockNumber" integer NOT NULL, "collectionId" uuid, "nftId" uuid, "fromId" uuid, "toId" uuid, CONSTRAINT "transaction_constraint" UNIQUE ("tx"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_liked_collections_collections" ("usersId" uuid NOT NULL, "collectionsId" uuid NOT NULL, CONSTRAINT "PK_9d1b790edcec0dac19df0b3f4ba" PRIMARY KEY ("usersId", "collectionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad334a96f5ee641b09deb35f75" ON "users_liked_collections_collections" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a32fd01836571c6bf83006e263" ON "users_liked_collections_collections" ("collectionsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_liked_nf_ts_nfts" ("usersId" uuid NOT NULL, "nftsId" uuid NOT NULL, CONSTRAINT "PK_ddeb1743a48905f6c746b836650" PRIMARY KEY ("usersId", "nftsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da6cf45327705ae3ea73d4827a" ON "users_liked_nf_ts_nfts" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b1dd2dfdc6fe287cd74e7ea2dd" ON "users_liked_nf_ts_nfts" ("nftsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ADD CONSTRAINT "FK_4848981bd60a8c7e4df437366b5" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ADD CONSTRAINT "FK_83b61e0493f2646d2a299a4e14e" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD CONSTRAINT "FK_64f0aa1d5b42a7f617724e9cbe9" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_49219ff3396e8569af3e9ed7d4d" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_54ae741bcacc1543e979f064a97" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_0697b5941a6016ab531b156049e" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_8f7e03be67a425cce6663b36255" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_collections_collections" ADD CONSTRAINT "FK_ad334a96f5ee641b09deb35f75d" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_collections_collections" ADD CONSTRAINT "FK_a32fd01836571c6bf83006e2639" FOREIGN KEY ("collectionsId") REFERENCES "collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_nf_ts_nfts" ADD CONSTRAINT "FK_da6cf45327705ae3ea73d4827a2" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_nf_ts_nfts" ADD CONSTRAINT "FK_b1dd2dfdc6fe287cd74e7ea2ddc" FOREIGN KEY ("nftsId") REFERENCES "nfts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_liked_nf_ts_nfts" DROP CONSTRAINT "FK_b1dd2dfdc6fe287cd74e7ea2ddc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_nf_ts_nfts" DROP CONSTRAINT "FK_da6cf45327705ae3ea73d4827a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_collections_collections" DROP CONSTRAINT "FK_a32fd01836571c6bf83006e2639"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_liked_collections_collections" DROP CONSTRAINT "FK_ad334a96f5ee641b09deb35f75d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_8f7e03be67a425cce6663b36255"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_0697b5941a6016ab531b156049e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_54ae741bcacc1543e979f064a97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_49219ff3396e8569af3e9ed7d4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections" DROP CONSTRAINT "FK_64f0aa1d5b42a7f617724e9cbe9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" DROP CONSTRAINT "FK_83b61e0493f2646d2a299a4e14e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" DROP CONSTRAINT "FK_4848981bd60a8c7e4df437366b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b1dd2dfdc6fe287cd74e7ea2dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da6cf45327705ae3ea73d4827a"`,
    );
    await queryRunner.query(`DROP TABLE "users_liked_nf_ts_nfts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a32fd01836571c6bf83006e263"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad334a96f5ee641b09deb35f75"`,
    );
    await queryRunner.query(`DROP TABLE "users_liked_collections_collections"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TABLE "nfts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
