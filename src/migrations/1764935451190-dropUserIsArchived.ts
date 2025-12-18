import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764935451190 implements MigrationInterface {
  name = 'Migration1764935451190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_archived"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_archived" boolean NOT NULL DEFAULT false`,
    );
  }
}
