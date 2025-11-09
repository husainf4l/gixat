import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762529444597 implements MigrationInterface {
    name = 'InitialSchema1762529444597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration represents the baseline schema that was created via synchronize
        // All tables already exist, so this is just to establish the migration baseline
        
        // Create enum types if they don't exist
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE public.user_type_enum AS ENUM('business', 'client', 'system');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE public.car_make_enum AS ENUM('toyota', 'honda', 'nissan', 'ford', 'chevrolet', 'bmw', 'mercedes', 'audi', 'volkswagen', 'hyundai', 'kia', 'mazda', 'subaru', 'lexus', 'acura', 'infiniti', 'cadillac', 'lincoln', 'buick', 'gmc', 'dodge', 'ram', 'chrysler', 'jeep', 'tesla', 'volvo', 'jaguar', 'land_rover', 'porsche', 'maserati', 'ferrari', 'lamborghini', 'bentley', 'rolls_royce', 'other');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE public.repair_session_status_enum AS ENUM('customer_request', 'initial_inspection', 'test_drive_inspection', 'offer_preparation', 'offer_sent', 'offer_approved', 'offer_rejected', 'job_card_created', 'repair_in_progress', 'quality_check', 'final_inspection', 'ready_for_delivery', 'delivered', 'cancelled');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // No table creation needed as tables already exist from synchronize
        console.log('Initial schema migration completed - baseline established');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This would drop the entire schema, but since it's the initial migration,
        // we'll keep it simple and not implement the down migration
        console.log('Down migration not implemented for initial schema');
    }
}
