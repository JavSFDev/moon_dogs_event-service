import { MigrationInterface, QueryRunner } from 'typeorm';

export class revertTxContraint1681142294954 implements MigrationInterface {
  name = 'revertTxContraint1681142294954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9" UNIQUE ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "UQ_a219afd8dd77ed80f5a862f1db9"`,
    );
  }
}
