import { Module } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import { AwsS3Resolver } from './aws-s3.resolver';

@Module({
  providers: [AwsS3Service, AwsS3Resolver],
  exports: [AwsS3Service],
})
export class AwsModule {}
