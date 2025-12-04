# Health Checks Quick Reference

## ?? Available Endpoints

| Endpoint | Purpose | Public | Format |
|----------|---------|--------|--------|
| `/health` | Detailed health status | ? Yes | JSON |
| `/health/ready` | Readiness probe (critical only) | ? Yes | JSON |
| `/health/live` | Liveness probe | ? Yes | Plain |
| `/health-ui` | Visual dashboard | ? Yes | HTML |
| `/Admin/Health` | Admin dashboard | ?? Admin only | HTML |

## ?? Health Checks Configured

### Critical Services
- **PostgreSQL Database** - Application database connectivity
  - Timeout: 5s
  - Failure: Unhealthy

### Degraded Services (Non-Critical)
- **AWS S3 Storage** - File storage service
  - Timeout: 10s
  - Failure: Degraded
  
- **SMTP Email Service** - Email delivery
  - Timeout: 10s
  - Failure: Degraded

### System Checks
- **Memory Usage** - Application memory consumption
  - Timeout: 3s
  - Thresholds:
    - ? Healthy: < 512 MB
    - ?? Degraded: 512 MB - 1 GB
    - ? Unhealthy: > 1 GB

## ?? Quick Commands

### Test Health Check (Local)
```bash
# Detailed health check
curl http://localhost:5000/health

# Readiness check
curl http://localhost:5000/health/ready

# Liveness check
curl http://localhost:5000/health/live
```

### Test Health Check (Production)
```bash
# Detailed health check
curl https://your-domain.com/health

# Pretty print JSON
curl https://your-domain.com/health | jq .
```

### Docker Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/health/live || exit 1
```

### Kubernetes Probes
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 5
```

## ?? Health Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| ? Healthy | All systems operational | None |
| ?? Degraded | Non-critical services failing | Investigate soon |
| ? Unhealthy | Critical services failing | **Immediate action required** |

## ?? Troubleshooting

### Database Health Check Fails
```bash
# Check connection string
echo $DATABASE_CONNECTION_STRING

# Test database connection
psql $DATABASE_CONNECTION_STRING -c "SELECT 1"

# Check database logs
docker logs gixat-postgres
```

### AWS S3 Health Check Fails
```bash
# Check AWS credentials
aws s3 ls s3://your-bucket-name

# Verify environment variables
echo $AWS_ACCESS_KEY
echo $AWS_SECRET_KEY
echo $AWS_S3_BUCKET_NAME
```

### SMTP Health Check Fails
```bash
# Test SMTP connection
telnet smtp.gmail.com 465

# Verify environment variables
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
```

### Memory Health Check Warning
```bash
# Check memory usage
docker stats gixat

# View GC collections in health endpoint
curl http://localhost:5000/health | jq '.entries["Memory Usage"].data'
```

## ?? Setting Up Alerts

### Azure Monitor
```bash
# Create alert rule for unhealthy status
az monitor metrics alert create \
  --name "Gixat-Unhealthy" \
  --resource-group myResourceGroup \
  --scopes /subscriptions/.../resourceGroups/.../providers/Microsoft.Web/sites/gixat \
  --condition "avg HealthCheckStatus < 1" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### AWS CloudWatch
```json
{
  "AlarmName": "Gixat-HealthCheck-Failed",
  "ComparisonOperator": "LessThanThreshold",
  "EvaluationPeriods": 2,
  "MetricName": "HealthyHostCount",
  "Namespace": "AWS/ApplicationELB",
  "Period": 60,
  "Statistic": "Average",
  "Threshold": 1.0
}
```

## ?? Monitoring URLs

- **Health UI**: https://your-domain.com/health-ui
- **Admin Dashboard**: https://your-domain.com/Admin/Health
- **GraphQL Playground**: https://your-domain.com/graphql
- **Metrics** (if Prometheus enabled): https://your-domain.com/metrics

## ?? Best Practices

1. **Monitor `/health/ready` from load balancers** - Routes traffic only to healthy instances
2. **Use `/health/live` for container orchestration** - Detects and restarts crashed instances
3. **Check `/health-ui` regularly** - Visual trends help identify issues early
4. **Set up alerts on critical checks** - Get notified before users are affected
5. **Test health checks in staging** - Verify they catch real failures

## ?? Health Check Response Examples

### Healthy Response
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0234567",
  "entries": {
    "PostgreSQL Database": {
      "status": "Healthy",
      "description": "Database connection is healthy"
    }
  }
}
```

### Degraded Response
```json
{
  "status": "Degraded",
  "totalDuration": "00:00:00.1234567",
  "entries": {
    "PostgreSQL Database": {
      "status": "Healthy"
    },
    "SMTP Email Service": {
      "status": "Unhealthy",
      "description": "SMTP server is not accessible",
      "exception": "Connection refused"
    }
  }
}
```

## ?? Additional Resources

- [Full Health Checks Documentation](./HEALTH_CHECKS.md)
- [Monitoring Guide](./MONITORING.md)
- [Microsoft Health Checks Docs](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
