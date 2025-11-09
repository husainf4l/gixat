import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerSystem1762553860737 implements MigrationInterface {
    name = 'AddCustomerSystem1762553860737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."customer_communication_logs_type_enum" AS ENUM('email', 'sms', 'phone', 'whatsapp', 'in_person', 'system')`);
        await queryRunner.query(`CREATE TYPE "public"."customer_communication_logs_direction_enum" AS ENUM('inbound', 'outbound')`);
        await queryRunner.query(`CREATE TABLE "customer_communication_logs" ("id" SERIAL NOT NULL, "type" "public"."customer_communication_logs_type_enum" NOT NULL, "direction" "public"."customer_communication_logs_direction_enum" NOT NULL, "subject" character varying NOT NULL, "message" text NOT NULL, "fromAddress" character varying, "toAddress" character varying, "isRead" boolean NOT NULL DEFAULT false, "isDelivered" boolean NOT NULL DEFAULT true, "deliveredAt" TIMESTAMP, "deliveryError" text, "relatedEntityType" character varying, "relatedEntityId" integer, "metadata" json, "customerId" integer NOT NULL, "createdById" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e9334105a47ae66981a8b1f8c05" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer_preferences" ("id" SERIAL NOT NULL, "category" character varying NOT NULL, "key" character varying NOT NULL, "value" text NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, "customerId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_20e6c37c7c01599737048da443b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."loyalty_transactions_type_enum" AS ENUM('earned', 'redeemed', 'expired', 'bonus', 'adjustment')`);
        await queryRunner.query(`CREATE TABLE "loyalty_transactions" ("id" SERIAL NOT NULL, "type" "public"."loyalty_transactions_type_enum" NOT NULL, "points" numeric(10,2) NOT NULL, "balanceBefore" numeric(10,2) NOT NULL, "balanceAfter" numeric(10,2) NOT NULL, "reason" character varying NOT NULL, "description" text, "expiryDate" TIMESTAMP, "relatedEntityType" character varying, "relatedEntityId" integer, "metadata" json, "customerId" integer NOT NULL, "createdById" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_df453f678b7575221b335673362" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."customers_customertype_enum" AS ENUM('individual', 'business', 'insurance')`);
        await queryRunner.query(`CREATE TYPE "public"."customers_status_enum" AS ENUM('active', 'inactive', 'blocked', 'vip')`);
        await queryRunner.query(`CREATE TYPE "public"."customers_preferredcontactmethod_enum" AS ENUM('email', 'sms', 'phone', 'whatsapp')`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "customerNumber" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying, "email" character varying NOT NULL, "phone" character varying NOT NULL, "alternativePhone" character varying, "dateOfBirth" TIMESTAMP, "customerType" "public"."customers_customertype_enum" NOT NULL DEFAULT 'individual', "status" "public"."customers_status_enum" NOT NULL DEFAULT 'active', "address" character varying, "city" character varying, "state" character varying, "postalCode" character varying, "country" character varying, "companyName" character varying, "taxId" character varying, "registrationNumber" character varying, "preferredContactMethod" "public"."customers_preferredcontactmethod_enum" NOT NULL DEFAULT 'email', "whatsappNumber" character varying, "emailNotifications" boolean NOT NULL DEFAULT true, "smsNotifications" boolean NOT NULL DEFAULT true, "marketingConsent" boolean NOT NULL DEFAULT false, "loyaltyPoints" numeric(10,2) NOT NULL DEFAULT '0', "totalSpent" numeric(10,2) NOT NULL DEFAULT '0', "visitCount" integer NOT NULL DEFAULT '0', "lastVisitDate" TIMESTAMP, "averageRating" numeric(3,2), "totalReviews" integer NOT NULL DEFAULT '0', "notes" text, "tags" text, "insuranceProvider" character varying, "insurancePolicyNumber" character varying, "insuranceExpiryDate" TIMESTAMP, "emergencyContactName" character varying, "emergencyContactPhone" character varying, "businessId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ac2fd5d477df162f3f6246c7284" UNIQUE ("customerNumber"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "customerId" integer`);
        await queryRunner.query(`ALTER TABLE "customer_communication_logs" ADD CONSTRAINT "FK_e891e153c6fec6baa4a0e5a34a1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_communication_logs" ADD CONSTRAINT "FK_20c6fcadfd8831a83619daaae62" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer_preferences" ADD CONSTRAINT "FK_aca1fdc0d00b7876fe33f188f79" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "FK_652010695a854dd52f21ceb485f" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "FK_732c8f06306dea15055e7f8197e" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_652f05fd67ef9354cb047aae572" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_c85417e15c1171b9e2a9b85a578" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_c85417e15c1171b9e2a9b85a578"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_652f05fd67ef9354cb047aae572"`);
        await queryRunner.query(`ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "FK_732c8f06306dea15055e7f8197e"`);
        await queryRunner.query(`ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "FK_652010695a854dd52f21ceb485f"`);
        await queryRunner.query(`ALTER TABLE "customer_preferences" DROP CONSTRAINT "FK_aca1fdc0d00b7876fe33f188f79"`);
        await queryRunner.query(`ALTER TABLE "customer_communication_logs" DROP CONSTRAINT "FK_20c6fcadfd8831a83619daaae62"`);
        await queryRunner.query(`ALTER TABLE "customer_communication_logs" DROP CONSTRAINT "FK_e891e153c6fec6baa4a0e5a34a1"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "customerId"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TYPE "public"."customers_preferredcontactmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customers_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customers_customertype_enum"`);
        await queryRunner.query(`DROP TABLE "loyalty_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."loyalty_transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "customer_preferences"`);
        await queryRunner.query(`DROP TABLE "customer_communication_logs"`);
        await queryRunner.query(`DROP TYPE "public"."customer_communication_logs_direction_enum"`);
        await queryRunner.query(`DROP TYPE "public"."customer_communication_logs_type_enum"`);
    }

}
