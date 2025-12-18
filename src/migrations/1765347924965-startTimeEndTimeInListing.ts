import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765347924965 implements MigrationInterface {
  name = 'Migration1765347924965';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "start_time" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "end_time" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "end_time"`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "start_time"`);
  }
}
