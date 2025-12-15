import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765792906876 implements MigrationInterface {
    name = 'Migration1765792906876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "image"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" ADD "image" text array`);
    }

}
