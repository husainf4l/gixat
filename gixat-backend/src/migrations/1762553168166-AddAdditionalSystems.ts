import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdditionalSystems1762553168166 implements MigrationInterface {
    name = 'AddAdditionalSystems1762553168166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."technicians_status_enum" AS ENUM('active', 'on_leave', 'busy', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "technicians" ("id" SERIAL NOT NULL, "employeeId" character varying NOT NULL, "specializations" text NOT NULL, "hourlyRate" numeric(8,2) NOT NULL, "status" "public"."technicians_status_enum" NOT NULL DEFAULT 'active', "workSchedule" json, "certifications" character varying, "hireDate" date, "notes" text, "userId" integer NOT NULL, "businessId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e79a55f4a0b862b14f40ffbe244" UNIQUE ("employeeId"), CONSTRAINT "PK_b14514b23605f79475be53065b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('email', 'sms', 'push')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_template_enum" AS ENUM('repair_status_update', 'offer_ready', 'ready_for_pickup', 'appointment_reminder', 'insurance_expiry', 'welcome_message')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_status_enum" AS ENUM('pending', 'sent', 'delivered', 'failed')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "template" "public"."notifications_template_enum" NOT NULL, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'pending', "recipient" character varying NOT NULL, "subject" character varying NOT NULL, "content" text NOT NULL, "relatedEntityType" character varying, "relatedEntityId" integer, "businessId" integer NOT NULL, "metadata" json, "sentAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "errorMessage" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage', 'count')`);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" SERIAL NOT NULL, "movementNumber" character varying NOT NULL, "type" "public"."stock_movements_type_enum" NOT NULL, "quantity" numeric(10,2) NOT NULL, "previousStock" numeric(10,2) NOT NULL, "newStock" numeric(10,2) NOT NULL, "unitCost" numeric(10,4), "totalValue" numeric(10,2), "reason" text, "referenceNumber" character varying, "inventoryItemId" integer NOT NULL, "businessId" integer NOT NULL, "createdById" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4808d1cf7137ca8cca546143e00" UNIQUE ("movementNumber"), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_items_category_enum" AS ENUM('engine_parts', 'transmission', 'brakes', 'electrical', 'bodywork', 'interior', 'suspension', 'ac_heating', 'exhaust', 'wheels_tires', 'fluids', 'filters', 'tools', 'consumables', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_items_status_enum" AS ENUM('in_stock', 'low_stock', 'out_of_stock', 'discontinued')`);
        await queryRunner.query(`CREATE TABLE "inventory_items" ("id" SERIAL NOT NULL, "sku" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "category" "public"."inventory_items_category_enum" NOT NULL, "brand" character varying, "model" character varying, "partNumber" character varying, "manufacturerPartNumber" character varying, "currentStock" numeric(10,2) NOT NULL DEFAULT '0', "minimumStock" numeric(10,2) NOT NULL DEFAULT '5', "maximumStock" numeric(10,2), "unitCost" numeric(10,4) NOT NULL, "sellingPrice" numeric(10,4) NOT NULL, "unit" character varying, "location" character varying, "barcode" character varying, "status" "public"."inventory_items_status_enum" NOT NULL DEFAULT 'in_stock', "supplierId" integer, "businessId" integer NOT NULL, "lastOrderDate" TIMESTAMP, "lastOrderQuantity" numeric(10,2), "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_395ec8d9e0cad6e3890b989fc1c" UNIQUE ("sku"), CONSTRAINT "PK_cf2f451407242e132547ac19169" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" text, "contactPerson" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" text, "website" character varying, "taxId" character varying, "paymentTerms" text, "creditLimit" integer DEFAULT '0', "rating" integer DEFAULT '1', "notes" text, "businessId" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6f01a03dcb1aa33822e19534cd6" UNIQUE ("code"), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_type_enum" AS ENUM('inspection', 'repair', 'maintenance', 'consultation', 'pickup_delivery')`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "appointmentNumber" character varying NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'scheduled', "type" "public"."appointments_type_enum" NOT NULL, "priority" "public"."appointments_priority_enum" NOT NULL DEFAULT 'normal', "title" character varying NOT NULL, "description" text, "scheduledDate" TIMESTAMP NOT NULL, "scheduledTime" character varying NOT NULL, "estimatedDuration" integer NOT NULL DEFAULT '60', "actualStartTime" TIMESTAMP, "actualEndTime" TIMESTAMP, "clientId" integer NOT NULL, "carId" integer, "businessId" integer NOT NULL, "assignedTechnicianId" integer, "createdById" integer NOT NULL, "customerNotes" text, "internalNotes" text, "completionNotes" text, "reminderSent" boolean, "confirmedAt" TIMESTAMP, "cancelledAt" TIMESTAMP, "cancellationReason" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dc42b126dbf1ec5310d769e1b27" UNIQUE ("appointmentNumber"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "technicians" ADD CONSTRAINT "FK_8099b6a6478964454f22f7e0f8c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "technicians" ADD CONSTRAINT "FK_b69a69835ced080944697a6de98" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_1525681a7e669aaa6b8edf0e256" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_769feb209282a3f34e42d89f1dd" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_847ae48018bbd08f4fbbac53006" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_a44bd406bdca713a77887d776b3" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_items" ADD CONSTRAINT "FK_6928b8bc3071ae9b571f9fca34d" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_items" ADD CONSTRAINT "FK_df1703e8e0b20ff09f5d09eae08" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "suppliers" ADD CONSTRAINT "FK_c17125a2cc40433d03130fe0410" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_c4dbd8eb292b83b5dc67be3cf45" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0efa3756b6d17d2d06a918997db" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_7bf98fac7b5260d4b1a44f938d6" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_f60acb22cf69eca5ec95895ed13" FOREIGN KEY ("assignedTechnicianId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_816a6b9826083e9dd4ade9e950d" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_816a6b9826083e9dd4ade9e950d"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_f60acb22cf69eca5ec95895ed13"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_7bf98fac7b5260d4b1a44f938d6"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_0efa3756b6d17d2d06a918997db"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_c4dbd8eb292b83b5dc67be3cf45"`);
        await queryRunner.query(`ALTER TABLE "suppliers" DROP CONSTRAINT "FK_c17125a2cc40433d03130fe0410"`);
        await queryRunner.query(`ALTER TABLE "inventory_items" DROP CONSTRAINT "FK_df1703e8e0b20ff09f5d09eae08"`);
        await queryRunner.query(`ALTER TABLE "inventory_items" DROP CONSTRAINT "FK_6928b8bc3071ae9b571f9fca34d"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_a44bd406bdca713a77887d776b3"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_847ae48018bbd08f4fbbac53006"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_769feb209282a3f34e42d89f1dd"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_1525681a7e669aaa6b8edf0e256"`);
        await queryRunner.query(`ALTER TABLE "technicians" DROP CONSTRAINT "FK_b69a69835ced080944697a6de98"`);
        await queryRunner.query(`ALTER TABLE "technicians" DROP CONSTRAINT "FK_8099b6a6478964454f22f7e0f8c"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP TABLE "inventory_items"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_items_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_items_category_enum"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_template_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "technicians"`);
        await queryRunner.query(`DROP TYPE "public"."technicians_status_enum"`);
    }

}
