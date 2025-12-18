import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765212486241 implements MigrationInterface {
  name = 'Migration1765212486241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "listing" ("ID" SERIAL NOT NULL, "image" character varying NOT NULL, "service_type" character varying NOT NULL, "commercial_price" integer, "name" character varying NOT NULL, "description" character varying NOT NULL, "packageType" character varying NOT NULL, "packageCreatedAt" TIMESTAMP NOT NULL, "contactNo" character varying NOT NULL, "country" character varying NOT NULL, "address" character varying NOT NULL, "locationCoordinates" geometry(Point,4326), "is_active" boolean NOT NULL DEFAULT true, "is_archived" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "category" integer, "sub_category" integer, CONSTRAINT "PK_8154b33251ea21b6f548bcf7cd5" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_list_current_location" ON "listing" USING GiST ("locationCoordinates") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_category" ("ID" SERIAL NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "category_id" integer, CONSTRAINT "PK_c12df81e48f016217f3b12ea4e0" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("ID" SERIAL NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_557706bd2e6cf734859b86d7b86" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_55d9c37f3b9e8de5509c70caf63" FOREIGN KEY ("category") REFERENCES "category"("ID") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_a645ed0563c32fec123e4c983e1" FOREIGN KEY ("sub_category") REFERENCES "sub_category"("ID") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ADD CONSTRAINT "FK_4ec8c495300259f2322760a39fa" FOREIGN KEY ("category_id") REFERENCES "category"("ID") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_category" DROP CONSTRAINT "FK_4ec8c495300259f2322760a39fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_a645ed0563c32fec123e4c983e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_55d9c37f3b9e8de5509c70caf63"`,
    );
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "sub_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_list_current_location"`);
    await queryRunner.query(`DROP TABLE "listing"`);
  }
}
