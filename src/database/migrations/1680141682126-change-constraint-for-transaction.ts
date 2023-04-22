import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeConstraintForTransaction1680141682126
  implements MigrationInterface
{
  name = 'changeConstraintForTransaction1680141682126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9" UNIQUE ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transaction_constraint"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transaction_constraint" UNIQUE ("tx")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9"`,
    );
  }
}
