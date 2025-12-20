import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766256818465 implements MigrationInterface {
    name = 'Migration1766256818465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_payment" ADD "isPaid" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_payment" DROP COLUMN "isPaid"`);
    }

}
