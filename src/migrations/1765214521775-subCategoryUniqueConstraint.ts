import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765214521775 implements MigrationInterface {
  name = 'Migration1765214521775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_category" DROP CONSTRAINT "FK_4ec8c495300259f2322760a39fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ALTER COLUMN "category_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ADD CONSTRAINT "UQ_54f3740e400939fb7aaa135480a" UNIQUE ("name", "category_id")`,
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
      `ALTER TABLE "sub_category" DROP CONSTRAINT "UQ_54f3740e400939fb7aaa135480a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ALTER COLUMN "category_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_category" ADD CONSTRAINT "FK_4ec8c495300259f2322760a39fa" FOREIGN KEY ("category_id") REFERENCES "category"("ID") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
