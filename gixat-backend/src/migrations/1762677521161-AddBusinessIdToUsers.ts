import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessIdToUsers1762677521161 implements MigrationInterface {
    name = 'AddBusinessIdToUsers1762677521161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "businessId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_78725ac7117e7526e028014606b" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_78725ac7117e7526e028014606b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessId"`);
    }

}
