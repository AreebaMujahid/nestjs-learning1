import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764927636964 implements MigrationInterface {
  name = 'Migration1764927636964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_disable"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_disable" boolean NOT NULL DEFAULT true`,
    );
  }
}
