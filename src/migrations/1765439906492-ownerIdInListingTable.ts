import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765439906492 implements MigrationInterface {
  name = 'Migration1765439906492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listing" ADD "owner_id" integer`);
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "service_type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."listing_service_type_enum" AS ENUM('commercial', 'non-commercial')`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "service_type" "public"."listing_service_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "listing" ADD CONSTRAINT "FK_f8b82c045b09ac766d0bcccbe2b" FOREIGN KEY ("owner_id") REFERENCES "user"("ID") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listing" DROP CONSTRAINT "FK_f8b82c045b09ac766d0bcccbe2b"`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "service_type"`);
    await queryRunner.query(`DROP TYPE "public"."listing_service_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "listing" ADD "service_type" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "owner_id"`);
  }
}
