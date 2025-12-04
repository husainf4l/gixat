# Application Monitoring Guide

## Overview

This guide covers monitoring strategies, metrics collection, logging, and observability for the Gixat application.

## Key Metrics to Monitor

### Application Metrics

1. **Request Rate**
   - Total requests per second
   - Requests per endpoint
   - GraphQL query rate

2. **Response Time**
   - Average response time
   - P50, P95, P99 latency
   - Slow query identification

3. **Error Rate**
   - HTTP 4xx errors
   - HTTP 5xx errors
   - Exception count by type

4. **Throughput**
   - Successful requests per minute
   - Data processed (MB/s)
   - GraphQL operations per second

### Infrastructure Metrics

1. **CPU Usage**
   - Overall CPU utilization
   - Per-core usage
   - CPU throttling events

2. **Memory**
   - Working set size
   - GC heap size
   - Gen 0/1/2 collection counts
   - Memory leaks detection

3. **Disk I/O**
   - Read/write operations
   - Disk queue length
   - Available disk space

4. **Network**
   - Bytes sent/received
   - Connection count
   - Network errors

### Database Metrics

1. **Connection Pool**
   - Active connections
   - Idle connections
   - Connection wait time
   - Pool exhaustion events

2. **Query Performance**
   - Query execution time
   - Slow queries (> 1 second)
   - Index usage
   - Lock wait statistics

3. **Database Size**
   - Table sizes
   - Index sizes
   - Transaction log size
   - Growth rate

### Business Metrics

1. **User Activity**
   - Active users
   - User registrations
   - Login success/failure rate
   - Session duration

2. **Garage Operations**
   - Sessions created per day
   - Job cards completed
   - Average service time
   - Customer satisfaction metrics

3. **Revenue**
   - Total revenue
   - Revenue per garage
   - Average transaction value
   - Payment success rate

## Health Checks

### Configured Health Checks

See [HEALTH_CHECKS.md](./HEALTH_CHECKS.md) for detailed health check documentation.

Quick reference:
- `/health` - Full health status
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe
- `/health-ui` - Visual dashboard

## Logging Strategy

### Log Levels

1. **Trace** - Very detailed diagnostic information
2. **Debug** - Internal system events for debugging
3. **Information** - General informational messages
4. **Warning** - Abnormal or unexpected events
5. **Error** - Error events requiring attention
6. **Critical** - Critical failures requiring immediate action

### Structured Logging

Use structured logging for better querying:

```csharp
logger.LogInformation(
    "Session created: {SessionId} for client {ClientId} in company {CompanyId}",
    sessionId, clientId, companyId);
```

### Recommended Log Categories

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning",
      "Gixat.Web": "Information",
      "Gixat.Web.Modules.Sessions": "Debug",
      "Gixat.Web.HealthChecks": "Information"
    }
  }
}
```

## Monitoring Tools Integration

### 1. Application Insights (Azure)

#### Setup

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

#### Configuration

```json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=your-key;IngestionEndpoint=https://..."
  }
}
```

### 2. Prometheus + Grafana

#### Setup

```bash
dotnet add package prometheus-net.AspNetCore
dotnet add package prometheus-net.AspNetCore.HealthChecks
```

```csharp
// Program.cs
using Prometheus;

app.UseMetricServer(); // /metrics endpoint
app.UseHttpMetrics();

// Custom metrics
var requestCounter = Metrics.CreateCounter(
    "gixat_requests_total",
    "Total number of requests",
    new CounterConfiguration { LabelNames = new[] { "method", "endpoint", "status" } });
```

#### Grafana Dashboard

Import dashboard ID: 10427 (ASP.NET Core monitoring)

### 3. Seq (Structured Logging)

#### Setup

```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Seq
```

```csharp
// Program.cs
using Serilog;

builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .WriteTo.Seq("http://localhost:5341");
});
```

### 4. ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
dotnet add package Serilog.Sinks.Elasticsearch
```

```csharp
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri("http://localhost:9200"))
        {
            AutoRegisterTemplate = true,
            IndexFormat = $"gixat-logs-{DateTime.UtcNow:yyyy.MM}"
        });
});
```

## Alerting Rules

### Critical Alerts (Immediate Response)

1. **Database Connection Failure**
   - Condition: Database health check fails
   - Action: Page on-call engineer

2. **Application Crashes**
   - Condition: Process exits unexpectedly
   - Action: Auto-restart + alert

3. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Action: Notify team + investigate

4. **Memory Leak**
   - Condition: Memory > 90% for 10 minutes
   - Action: Prepare to restart instance

### Warning Alerts (Investigation Required)

1. **Slow Response Times**
   - Condition: P95 latency > 2 seconds
   - Action: Check database performance

2. **Degraded Health**
   - Condition: Non-critical service degraded
   - Action: Schedule fix

3. **High CPU**
   - Condition: CPU > 80% for 15 minutes
   - Action: Consider scaling

4. **Disk Space Low**
   - Condition: < 20% disk space available
   - Action: Clean up or increase capacity

## Performance Monitoring

### Application Performance Monitoring (APM)

Track these key metrics:

1. **Apdex Score** (Application Performance Index)
   - Target: > 0.9
   - Satisfied: < 500ms
   - Tolerating: < 2000ms
   - Frustrated: > 2000ms

2. **Transaction Traces**
   - Identify slow transactions
   - Database query analysis
   - External service calls

3. **Error Tracking**
   - Exception grouping
   - Error frequency
   - Affected users

### Database Query Monitoring

```csharp
// Enable query logging in development
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});
```

### Custom Metrics

```csharp
// Track business metrics
public class SessionMetrics
{
    private static readonly Counter SessionsCreated = Metrics.CreateCounter(
        "gixat_sessions_created_total",
        "Total number of sessions created",
        new CounterConfiguration { LabelNames = new[] { "company", "branch" } });

    private static readonly Histogram SessionDuration = Metrics.CreateHistogram(
        "gixat_session_duration_seconds",
        "Session duration in seconds");

    public void RecordSessionCreated(Guid companyId, Guid branchId)
    {
        SessionsCreated.WithLabels(companyId.ToString(), branchId.ToString()).Inc();
    }

    public void RecordSessionCompleted(TimeSpan duration)
    {
        SessionDuration.Observe(duration.TotalSeconds);
    }
}
```

## Dashboards

### Grafana Dashboard Components

1. **Overview**
   - Request rate
   - Error rate
   - Response time
   - Active users

2. **System Health**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

3. **Database**
   - Connection pool status
   - Query performance
   - Table sizes
   - Lock statistics

4. **Business Metrics**
   - Sessions created (hourly/daily)
   - Revenue trends
   - User growth
   - Feature usage

### Sample Grafana Query (Prometheus)

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate percentage
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
process_working_set_bytes / 1024 / 1024
```

## Incident Response

### Runbook

1. **Check Health Dashboard**
   - Visit `/health-ui` or `/Admin/Health`
   - Identify failing services

2. **Review Logs**
   - Check application logs
   - Review error traces
   - Identify patterns

3. **Check Metrics**
   - CPU, memory, disk
   - Database performance
   - External service status

4. **Remediation Steps**
   - Restart unhealthy services
   - Scale resources if needed
   - Roll back recent deployments
   - Fix identified issues

### Post-Incident

1. **Document the incident**
2. **Perform root cause analysis**
3. **Update monitoring/alerts**
4. **Improve runbooks**
5. **Prevent recurrence**

## Best Practices

1. **Monitor What Matters**
   - Focus on user-impacting metrics
   - Track business KPIs
   - Set meaningful thresholds

2. **Alert Responsibly**
   - Avoid alert fatigue
   - Prioritize alerts (critical vs warning)
   - Set appropriate thresholds

3. **Regular Review**
   - Weekly metrics review
   - Monthly dashboard updates
   - Quarterly alerting tuning

4. **Continuous Improvement**
   - Add metrics for new features
   - Refine thresholds based on data
   - Update dashboards regularly

5. **Test Monitoring**
   - Verify alerts fire correctly
   - Test incident response procedures
   - Practice recovery scenarios

## Cost Optimization

### Application Insights

- Set sampling rate to reduce costs
- Use daily cap to prevent overages
- Archive old data to cheaper storage

### Log Retention

```json
{
  "Logging": {
    "RetentionDays": {
      "Trace": 7,
      "Debug": 14,
      "Information": 30,
      "Warning": 90,
      "Error": 180,
      "Critical": 365
    }
  }
}
```

## Security Monitoring

### Key Security Metrics

1. **Authentication Failures**
   - Failed login attempts
   - Brute force detection
   - Suspicious patterns

2. **Authorization Violations**
   - Access denied events
   - Privilege escalation attempts
   - Cross-company access attempts

3. **Data Access**
   - Unusual query patterns
   - Large data exports
   - Sensitive data access

### Security Alerts

```csharp
// Log security events
logger.LogWarning(
    "Failed login attempt for user {Email} from IP {IpAddress}",
    email, ipAddress);

logger.LogError(
    "Unauthorized access attempt to company {CompanyId} by user {UserId}",
    companyId, userId);
```

## Resources

- [ASP.NET Core Logging](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/)
- [Health Checks in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Prometheus .NET Client](https://github.com/prometheus-net/prometheus-net)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
