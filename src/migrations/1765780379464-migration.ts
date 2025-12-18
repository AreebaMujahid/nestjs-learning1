import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765780379464 implements MigrationInterface {
  name = 'Migration1765780379464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package" ADD "stripe_price_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" ADD CONSTRAINT "UQ_ef80fb98317aad0aa50964d0000" UNIQUE ("stripe_price_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package" DROP CONSTRAINT "UQ_ef80fb98317aad0aa50964d0000"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" DROP COLUMN "stripe_price_id"`,
    );
  }
}
