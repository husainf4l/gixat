# Health Checks and Monitoring

## Overview

Gixat includes comprehensive health checks and monitoring capabilities to ensure system reliability and availability.

## Health Check Endpoints

### 1. Detailed Health Check
**URL**: `/health`

Returns detailed health information for all registered health checks in JSON format.

```bash
curl https://your-domain.com/health
```

**Response Example**:
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.1234567",
  "entries": {
    "PostgreSQL Database": {
      "status": "Healthy",
      "description": "Database connection is healthy",
      "duration": "00:00:00.0123456",
      "data": {
        "server": "localhost",
        "database": "gixat"
      }
    },
    "AWS S3 Storage": {
      "status": "Healthy",
      "description": "AWS S3 bucket 'my-bucket' is accessible",
      "duration": "00:00:00.0567890",
      "data": {
        "bucket": "my-bucket",
        "region": "us-east-1"
      }
    }
  }
}
```

### 2. Readiness Check (Critical Services)
**URL**: `/health/ready`

Returns only critical health checks (database). Use this for load balancer health checks.

```bash
curl https://your-domain.com/health/ready
```

### 3. Liveness Check
**URL**: `/health/live`

Simple endpoint that returns 200 OK if the application is running. Use this for container orchestration liveness probes.

```bash
curl https://your-domain.com/health/live
```

### 4. Health Checks UI
**URL**: `/health-ui`

Interactive dashboard for visualizing health check results over time.

Access in browser: `https://your-domain.com/health-ui`

### 5. Admin Health Dashboard
**URL**: `/Admin/Health`

Razor Pages dashboard for administrators to view detailed health status.

**Requires**: Admin role authentication

## Available Health Checks

### 1. PostgreSQL Database
- **Type**: Critical
- **Timeout**: 5 seconds
- **Checks**: Database connectivity and query execution
- **Failure Impact**: Application cannot function

### 2. AWS S3 Storage
- **Type**: Degraded on failure
- **Timeout**: 10 seconds
- **Checks**: S3 bucket accessibility and permissions
- **Failure Impact**: File uploads will fail

### 3. SMTP Email Service
- **Type**: Degraded on failure
- **Timeout**: 10 seconds
- **Checks**: SMTP server connectivity and authentication
- **Failure Impact**: Emails cannot be sent

### 4. Memory Usage
- **Type**: System health
- **Timeout**: 3 seconds
- **Checks**: Application memory consumption
- **Thresholds**:
  - Healthy: < 512 MB
  - Degraded: 512 MB - 1 GB
  - Unhealthy: > 1 GB

## Health Check Tags

Health checks are organized with tags for filtering:

- `critical` - Essential for application functionality
- `database` - Database-related checks
- `storage` - File storage checks
- `email` - Email service checks
- `system` - System resource checks

## Configuration

### Health Checks Evaluation

Health checks are evaluated every 30 seconds by default. You can configure this in `Program.cs`:

```csharp
builder.Services
    .AddHealthChecksUI(setup =>
    {
        setup.SetEvaluationTimeInSeconds(30); // Check every 30 seconds
        setup.MaximumHistoryEntriesPerEndpoint(50); // Keep last 50 results
    })
```

### Custom Health Checks

Create custom health checks by implementing `IHealthCheck`:

```csharp
public class CustomHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        // Your health check logic
        var isHealthy = true; // Your check
        
        if (isHealthy)
        {
            return HealthCheckResult.Healthy("Service is healthy");
        }
        
        return HealthCheckResult.Unhealthy("Service is unhealthy");
    }
}
```

Register it in `Program.cs`:

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<CustomHealthCheck>("My Custom Check", 
        failureStatus: HealthStatus.Degraded,
        tags: new[] { "custom" });
```

## Docker Health Checks

For Docker deployments, add to your `Dockerfile`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/health/live || exit 1
```

## Kubernetes Health Probes

Example Kubernetes deployment with health probes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gixat
spec:
  template:
    spec:
      containers:
      - name: gixat
        image: gixat:latest
        livenessProbe:
          httpGet:
            path: /health/live
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
```

## Monitoring Integration

### Application Insights

To integrate with Azure Application Insights, add:

```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

### Prometheus

For Prometheus metrics, install:

```bash
dotnet add package prometheus-net.AspNetCore
```

And configure:

```csharp
app.UseMetricServer(); // Expose /metrics endpoint
app.UseHttpMetrics();
```

## Alerting

Set up alerts based on health check failures:

1. **Azure Monitor**: Configure alerts on Application Insights metrics
2. **AWS CloudWatch**: Set up alarms for ECS/EKS health checks
3. **Datadog**: Configure monitors for health check endpoints
4. **PagerDuty**: Integrate with health check webhooks

## Troubleshooting

### Health Check Always Fails

1. Check connection strings in `.env` file
2. Verify external services (AWS, SMTP) credentials
3. Check firewall rules for outbound connections
4. Review logs for detailed error messages

### High Memory Usage Alert

1. Check for memory leaks using diagnostic tools
2. Review recent code changes
3. Monitor GC collections in health check data
4. Consider scaling up resources

### Degraded Status

Degraded status means non-critical services are failing:

1. Application continues to function
2. Some features may be unavailable
3. Investigate and fix degraded services
4. Monitor for escalation to unhealthy

## Best Practices

1. **Always monitor critical services** - Database is tagged as critical
2. **Set appropriate timeouts** - Avoid slow health checks
3. **Use different endpoints** - Separate liveness and readiness
4. **Monitor trends** - Use Health UI to track patterns
5. **Alert on degraded state** - Don't wait for unhealthy
6. **Test health checks** - Verify they catch real failures
7. **Document failure impact** - Help ops teams prioritize

## Security

The `/Admin/Health` page requires:
- User authentication
- Admin role membership

The `/health`, `/health/ready`, and `/health/live` endpoints are public for load balancer and monitoring tool access.

To restrict health check endpoints, add authentication:

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => true
})
.RequireAuthorization(); // Require authentication
```

## Performance Impact

Health checks have minimal performance impact:

- Database check: ~10-20ms
- AWS S3 check: ~50-100ms
- SMTP check: ~100-200ms
- Memory check: ~1-5ms

Total overhead: ~200-400ms every 30 seconds per instance.
