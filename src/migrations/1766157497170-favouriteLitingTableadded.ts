import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766157497170 implements MigrationInterface {
    name = 'Migration1766157497170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "favourite_listing" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "listing_id" integer, CONSTRAINT "PK_2e3ddca7ee4450e8bdefe3c8023" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "favourite_listing" ADD CONSTRAINT "FK_853329df76b25c4d55310778d70" FOREIGN KEY ("user_id") REFERENCES "user"("ID") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favourite_listing" ADD CONSTRAINT "FK_5e25e26b976e569cda35650ece5" FOREIGN KEY ("listing_id") REFERENCES "listing"("ID") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favourite_listing" DROP CONSTRAINT "FK_5e25e26b976e569cda35650ece5"`);
        await queryRunner.query(`ALTER TABLE "favourite_listing" DROP CONSTRAINT "FK_853329df76b25c4d55310778d70"`);
        await queryRunner.query(`DROP TABLE "favourite_listing"`);
    }

}
