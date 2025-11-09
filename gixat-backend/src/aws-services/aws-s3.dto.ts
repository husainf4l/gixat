import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class S3UploadResponse {
  @Field()
  url: string;

  @Field()
  key: string;

  @Field({ nullable: true })
  bucket?: string;
}

@ObjectType()
export class S3PresignedUrlResponse {
  @Field()
  url: string;

  @Field()
  expiresIn: number;
}

@ObjectType()
export class S3ObjectInfo {
  @Field()
  key: string;

  @Field(() => Int)
  size: number;

  @Field()
  lastModified: string;
}

@ObjectType()
export class S3HealthCheckDetails {
  @Field(() => Int)
  objectCount: number;

  @Field(() => [S3ObjectInfo])
  sampleObjects: S3ObjectInfo[];

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class S3HealthCheckResponse {
  @Field()
  status: string;

  @Field()
  message: string;

  @Field({ nullable: true })
  bucket?: string;

  @Field({ nullable: true })
  region?: string;

  @Field()
  timestamp: string;

  @Field(() => S3HealthCheckDetails, { nullable: true })
  details?: S3HealthCheckDetails;
}
