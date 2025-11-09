import { Resolver, Query } from '@nestjs/graphql';
import { AwsS3Service } from '../../aws-services/aws-s3.service';

@Resolver()
export class AwsResolver {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  @Query(() => String, { name: 'awsHealthCheck' })
  async awsHealthCheck(): Promise<string> {
    const isHealthy = await this.awsS3Service.healthCheck();
    return isHealthy ? 'AWS S3 connection is healthy' : 'AWS S3 connection failed';
  }
}