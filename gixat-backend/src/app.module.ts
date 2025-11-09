import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BusinessModule } from './business/business.module';
import { AuthModule } from './auth/auth.module';
import { OperationsModule } from './operations/operations.module';
import { AwsModule } from './aws-services/aws.module';
import { NotificationModule } from './notifications/notification.module';
import { AppointmentModule } from './appointments/appointment.module';
import { InventoryModule } from './inventory/inventory.module';
import { TechnicianModule } from './technicians/technician.module';
import { CustomerModule } from './customers/customer.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '149.200.251.12',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'husain',
      password: process.env.DB_PASSWORD || 'tt55oo77',
      database: process.env.DB_DATABASE || 'gixat',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: false, // Use migrations instead
      logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      migrationsRun: true, // Automatically run migrations on startup
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
      path: '/api/graphql',
      context: (request) => ({ req: request }),
    }),
    UserModule,
    BusinessModule,
    AuthModule,
    OperationsModule,
    AwsModule,
    NotificationModule,
    AppointmentModule,
    InventoryModule,
    TechnicianModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
