import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTvAndRoyaltyField1680035534882 implements MigrationInterface {
  name = 'addTvAndRoyaltyField1680035534882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collections" ADD "volume" integer DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD "royalty" integer DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "nfts" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "nfts" ADD "price" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nfts" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "nfts" ADD "price" integer`);
    await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "royalty"`);
    await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "volume"`);
  }
}
