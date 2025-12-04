using Amazon.S3;
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
        var awsOptions = configuration.GetAWSOptions();
        if (!string.IsNullOrEmpty(configuration["AWS:AccessKey"]))
        {
            services.AddDefaultAWSOptions(awsOptions);
            services.AddAWSService<IAmazonS3>();
        }
        else
        {
            services.AddSingleton<IAmazonS3>(sp => 
            {
                var config = new AmazonS3Config
                {
                    ServiceURL = configuration["AWS:S3:ServiceURL"] ?? "https://s3.amazonaws.com",
                    ForcePathStyle = true
                };
                return new AmazonS3Client(
                    configuration["AWS:AccessKey"] ?? "",
                    configuration["AWS:SecretKey"] ?? "",
                    config);
            });
        }
        return services;
    }
}
