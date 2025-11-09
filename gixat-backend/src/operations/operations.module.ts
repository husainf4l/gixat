import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AwsModule } from '../aws-services/aws.module';

// Entities
import { Client } from './entities/client.entity';
import { Car } from './entities/car.entity';
import { RepairSession } from './entities/repair-session.entity';
import { Inspection } from './entities/inspection.entity';
import { Media } from './entities/media.entity';
import { Offer } from './entities/offer.entity';
import { OfferItem } from './entities/offer-item.entity';
import { JobCard } from './entities/job-card.entity';
import { JobTask } from './entities/job-task.entity';
import { Part } from './entities/part.entity';

// Services
import { ClientService } from './services/client.service';
import { CarService } from './services/car.service';
import { RepairSessionService } from './services/repair-session.service';
import { InspectionService } from './services/inspection.service';
import { OfferService } from './services/offer.service';
import { JobCardService } from './services/job-card.service';

// Resolvers
import { ClientResolver } from './resolvers/client.resolver';
import { CarResolver } from './resolvers/car.resolver';
import { RepairSessionResolver } from './resolvers/repair-session.resolver';
import { InspectionResolver } from './resolvers/inspection.resolver';
import { OfferResolver } from './resolvers/offer.resolver';
import { JobCardResolver } from './resolvers/job-card.resolver';
import { AwsResolver } from './resolvers/aws.resolver';

// Import external entities
import { Business } from '../business/entities/business.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core garage entities
      Client,
      Car,
      // Repair workflow entities
      RepairSession,
      Inspection,
      Media,
      Offer,
      OfferItem,
      JobCard,
      JobTask,
      Part,
      // External entities
      Business,
      User,
    ]),
    AuthModule,
    AwsModule,
  ],
  providers: [
    // Services
    ClientService,
    CarService,
    RepairSessionService,
    InspectionService,
    OfferService,
    JobCardService,
    // Resolvers
    ClientResolver,
    CarResolver,
    RepairSessionResolver,
    InspectionResolver,
    OfferResolver,
    JobCardResolver,
    AwsResolver,
  ],
  exports: [
    ClientService,
    CarService,
    RepairSessionService,
    InspectionService,
    OfferService,
    JobCardService,
    TypeOrmModule,
  ],
})
export class OperationsModule {}