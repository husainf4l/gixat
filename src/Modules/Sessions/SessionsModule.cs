using Amazon.S3;
using Amazon.Extensions.NETCore.Setup;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gixat.Modules.Sessions.Data;
using Gixat.Modules.Sessions.Interfaces;
using Gixat.Modules.Sessions.Services;

namespace Gixat.Modules.Sessions;

public static class SessionsModule
{
    public static IServiceCollection AddSessionsModule(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<SessionDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("Gixat.Web")));

        // Add AWS S3 - will be configured when credentials are provided
        var awsOptions = configuration.GetAWSOptions();
        if (!string.IsNullOrEmpty(configuration["AWS:AccessKey"]))
        {
            services.AddDefaultAWSOptions(awsOptions);
            services.AddAWSService<IAmazonS3>();
        }
        else
        {
            // Register a placeholder for development - replace with real implementation
            services.AddSingleton<IAmazonS3>(sp => 
            {
                // This will throw if used without proper configuration
                // In production, ensure AWS credentials are configured
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
}
