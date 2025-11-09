import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerResolver } from './customer.resolver';
import { Customer } from './entities/customer.entity';
import { CustomerCommunicationLog } from './entities/customer-communication-log.entity';
import { CustomerPreference } from './entities/customer-preference.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      CustomerCommunicationLog,
      CustomerPreference,
      LoyaltyTransaction,
    ]),
  ],
  providers: [CustomerResolver, CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}