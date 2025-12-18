import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765792580325 implements MigrationInterface {
    name = 'Migration1765792580325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "listing_image" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "listingId" integer, CONSTRAINT "PK_5884ca1c2018515c1d738fd18e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "image" text array`);
        await queryRunner.query(`ALTER TABLE "listing_image" ADD CONSTRAINT "FK_b0d09774d741ddf347b214b95e0" FOREIGN KEY ("listingId") REFERENCES "listing"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing_image" DROP CONSTRAINT "FK_b0d09774d741ddf347b214b95e0"`);
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "listing" ADD "image" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "listing_image"`);
    }

}
