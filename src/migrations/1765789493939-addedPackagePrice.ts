import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765789493939 implements MigrationInterface {
  name = 'Migration1765789493939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package" ADD "price" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "package" DROP COLUMN "price"`);
  }
}
