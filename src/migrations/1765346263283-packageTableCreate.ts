import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765346263283 implements MigrationInterface {
  name = 'Migration1765346263283';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" RENAME COLUMN "packageType" TO "packageId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "package" ("ID" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94642258804b3fa69a5072af30d" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "packageId"`);
    await queryRunner.query(`ALTER TABLE "listing" ADD "packageId" integer`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_1cd3023d33f11c467726bde5c45" FOREIGN KEY ("packageId") REFERENCES "package"("ID") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_1cd3023d33f11c467726bde5c45"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "packageId"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "packageId" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "package"`);
    await queryRunner.query(
      `ALTER TABLE "listing" RENAME COLUMN "packageId" TO "packageType"`,
    );
  }
}
