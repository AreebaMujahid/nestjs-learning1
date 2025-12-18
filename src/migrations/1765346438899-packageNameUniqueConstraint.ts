import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765346438899 implements MigrationInterface {
  name = 'Migration1765346438899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_archived" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "package" ADD CONSTRAINT "UQ_b23e12326a4218d09bd72301aa1" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package" DROP CONSTRAINT "UQ_b23e12326a4218d09bd72301aa1"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_archived"`);
  }
}
