# Database Migration Management Guide

## Overview
The Gixat garage management system now uses TypeORM migrations for production-ready database schema management.

## Configuration

### Environment Variables (.env)
```env
DB_HOST=149.200.251.12
DB_PORT=5432
DB_USERNAME=husain
DB_PASSWORD=tt55oo77
DB_DATABASE=gixat
NODE_ENV=development
```

### Migration Settings
- **Synchronize**: Disabled (production-safe)
- **Migrations**: Enabled with automatic execution
- **Migration Table**: `migrations`
- **Migration Directory**: `src/migrations/`

## Available Commands

### Development Commands
```bash
# Start application with migrations
npm run start:dev

# Generate migration from entity changes
npm run migration:generate src/migrations/MigrationName

# Create empty migration
npm run migration:create src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Database Schema Commands
```bash
# Drop entire schema (DANGER!)
npm run schema:drop

# Sync schema with entities (development only)
npm run schema:sync
```

## Migration Workflow

### 1. Making Entity Changes
When you modify entities (add/remove fields, change types):

```bash
# 1. Make your entity changes
# 2. Generate migration
npm run migration:generate src/migrations/AddNewField

# 3. Review generated migration file
# 4. Run migration
npm run migration:run
```

### 2. Creating Custom Migrations
For data migrations or complex schema changes:

```bash
# 1. Create empty migration
npm run migration:create src/migrations/MigrateUserData

# 2. Implement up() and down() methods
# 3. Run migration
npm run migration:run
```

### 3. Production Deployment
```bash
# 1. Deploy code
# 2. Run migrations (automatic on startup or manual)
npm run migration:run

# 3. Verify status
npm run migration:show
```

## Example Migration Structure

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPreferences1234567890 implements MigrationInterface {
    name = 'AddUserPreferences1234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "preferences" jsonb DEFAULT '{}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "preferences"
        `);
    }
}
```

## Best Practices

### ✅ DO:
- Always review generated migrations before running
- Test migrations on development database first
- Write reversible migrations (implement down() method)
- Use descriptive migration names
- Backup production data before major migrations

### ❌ DON'T:
- Use `synchronize: true` in production
- Modify existing migration files after they've been run
- Skip testing migrations
- Run migrations directly on production without testing

## Migration Status

Current baseline established with:
- ✅ Initial Schema Migration: `InitialSchema1762529444597`
- ✅ All core entities: Users, Businesses, Clients, Cars, RepairSessions
- ✅ Repair workflow: Inspections, Offers, JobCards, Parts
- ✅ Enum types: UserType, CarMake, RepairSessionStatus, etc.

## Troubleshooting

### Migration Conflicts
If multiple developers create migrations:
```bash
# Show current status
npm run migration:show

# Revert conflicting migration
npm run migration:revert

# Resolve conflicts and re-run
npm run migration:run
```

### Schema Drift
If database and entities are out of sync:
```bash
# Generate migration to fix drift
npm run migration:generate src/migrations/FixSchemaDrift

# Review and run
npm run migration:run
```

### Emergency Schema Sync (Development Only)
```bash
# Drop and recreate schema (DANGER!)
npm run schema:drop
npm run schema:sync
```

## Security Notes

- Environment variables are used for database credentials
- Migration files are version controlled
- Production databases should be backed up before migrations
- Use connection pooling and proper database permissions