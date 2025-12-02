using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using Gixat.Modules.Sessions.Enums;
using Gixat.Modules.Sessions.Interfaces;

namespace Gixat.Modules.Sessions.Services;

public class AwsS3Service : IAwsS3Service
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public AwsS3Service(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:S3:BucketName"] ?? "gixat-media";
    }

    public async Task<string> GeneratePresignedUploadUrlAsync(string key, string contentType, int expirationMinutes = 15)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            ContentType = contentType
        };

        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }

    public async Task<string> GeneratePresignedDownloadUrlAsync(string key, int expirationMinutes = 60)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        return await Task.FromResult(_s3Client.GetPreSignedURL(request));
    }

    public async Task<bool> DeleteObjectAsync(string key)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(request);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ObjectExistsAsync(string key)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            await _s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public string GenerateS3Key(Guid companyId, Guid sessionId, MediaCategory category, string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        return $"{companyId}/{sessionId}/{category.ToString().ToLower()}/{uniqueFileName}";
    }
}
