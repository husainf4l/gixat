using Amazon.S3;
using Amazon.S3.Model;
using Amazon.Runtime;
using Amazon.Extensions.NETCore.Setup;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gixat.Web.Modules.Sessions.Interfaces;
using Gixat.Web.Modules.Sessions.Services;

namespace Gixat.Web.Modules.Sessions;

public static class SessionsModule
{
    /// <summary>
    /// Register only services (no DbContext). Use when AppDbContext is registered centrally.
    /// </summary>
    public static IServiceCollection AddSessionsModuleServices(this IServiceCollection services)
    {
        // Register services
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<ICustomerRequestService, CustomerRequestService>();
        services.AddScoped<IInspectionService, InspectionService>();
        services.AddScoped<ITestDriveService, TestDriveService>();
        services.AddScoped<IJobCardService, JobCardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<IAwsS3Service, AwsS3Service>();

        return services;
    }

    /// <summary>
    /// Configure AWS S3 services. Call this in Program.cs if AWS is needed.
    /// </summary>
    public static IServiceCollection AddAwsS3(this IServiceCollection services, IConfiguration configuration)
    {
        var accessKey = configuration["AWS:AccessKey"];
        var secretKey = configuration["AWS:SecretKey"];
        var region = configuration["AWS:Region"];
        
        if (!string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey))
        {
            // Configure AWS credentials explicitly
            services.AddSingleton<IAmazonS3>(sp => 
            {
                var config = new AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(region ?? "us-east-1"),
                    Timeout = TimeSpan.FromSeconds(10),
                    MaxErrorRetry = 3
                };
                
                var credentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
                return new AmazonS3Client(credentials, config);
            });
        }
        else
        {
            // No credentials configured - create a dummy client for health checks
            services.AddSingleton<IAmazonS3>(sp => 
            {
                var config = new AmazonS3Config
                {
                    RegionEndpoint = Amazon.RegionEndpoint.USEast1
                };
                return new AmazonS3Client(config);
            });
        }
        
        return services;
    }
}
