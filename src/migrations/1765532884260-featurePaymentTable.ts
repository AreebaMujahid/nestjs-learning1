import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765532884260 implements MigrationInterface {
    name = 'Migration1765532884260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feature_payment" ("ID" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "status" character varying NOT NULL, "stripePaymentId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "listing_id" integer, CONSTRAINT "PK_06353e4c4ab6154a96f72581e36" PRIMARY KEY ("ID"))`);
        await queryRunner.query(`ALTER TABLE "feature_payment" ADD CONSTRAINT "FK_5893de0e8a68dae0885cc9d32b8" FOREIGN KEY ("listing_id") REFERENCES "listing"("ID") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feature_payment" DROP CONSTRAINT "FK_5893de0e8a68dae0885cc9d32b8"`);
        await queryRunner.query(`DROP TABLE "feature_payment"`);
    }

}
