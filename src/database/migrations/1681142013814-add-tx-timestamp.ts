import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTxTimestamp1681142013814 implements MigrationInterface {
  name = 'addTxTimestamp1681142013814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "timestamp" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "timestamp"`,
    );
  }
}
