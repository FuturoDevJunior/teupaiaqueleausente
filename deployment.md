# Deployment Guide

This guide provides detailed instructions for deploying the Super Email Brazil application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Security Considerations](#security-considerations)
6. [Monitoring Setup](#monitoring-setup)
7. [Performance Optimization](#performance-optimization)
8. [Maintenance](#maintenance)

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account
- Production domain
- SSL certificate
- CI/CD platform access (e.g., GitHub Actions)

## Environment Setup

1. **Production Environment Variables**

Create a secure production environment file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Rate Limiting Configuration
VITE_RATE_LIMIT_MAX_REQUESTS=100
VITE_RATE_LIMIT_BLOCK_DURATION=300000

# Cache Configuration
VITE_CACHE_MAX_AGE=60000
VITE_CACHE_MAX_SIZE=10000

# Security Configuration
VITE_MAX_CONTENT_LENGTH=50000
VITE_ALLOWED_DOMAINS=your-domain.com,other-domain.com
VITE_ENCRYPTION_KEY=your_production_encryption_key

# Monitoring Configuration
VITE_MONITORING_ENABLED=true
VITE_MONITORING_FLUSH_INTERVAL=30000
VITE_ERROR_SAMPLING_RATE=0.1
```

2. **SSL/TLS Configuration**

Ensure SSL/TLS is properly configured:
- Obtain SSL certificate
- Configure automatic renewal
- Enable HSTS
- Configure secure headers

## Build Process

1. **Production Build**

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Test production build
npm run preview
```

2. **Build Optimization**

- Enable code splitting
- Optimize asset compression
- Configure caching headers
- Implement CDN integration

## Deployment Options

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

### 2. Docker Deployment

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Traditional Hosting

```bash
# Build locally
npm run build

# Upload dist folder to your hosting provider
scp -r dist/* user@your-server:/var/www/html/
```

## Security Considerations

1. **Headers Configuration**

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

2. **Rate Limiting Configuration**

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req zone=one burst=20 nodelay;
```

3. **Firewall Rules**

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## Monitoring Setup

1. **Error Tracking**

Configure error tracking service (e.g., Sentry):

```javascript
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1
});
```

2. **Performance Monitoring**

Configure metrics collection:

```javascript
// Configure metrics endpoint
const metricsEndpoint = 'https://your-metrics-service.com/collect';

// Configure logging
const loggingConfig = {
  level: 'error',
  format: 'json'
};
```

3. **Health Checks**

Create health check endpoints:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

## Performance Optimization

1. **Caching Strategy**

```nginx
# Cache static assets
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}

# Cache API responses
location /api/ {
    proxy_cache my_cache;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_valid 200 60m;
}
```

2. **CDN Configuration**

```javascript
// Configure CDN URLs
const cdnConfig = {
  baseUrl: 'https://your-cdn.com',
  assets: '/assets',
  timeout: 5000
};
```

## Maintenance

1. **Backup Strategy**

```bash
# Backup database daily
0 0 * * * pg_dump -U postgres -d your_database > /backups/db_$(date +%Y%m%d).sql

# Rotate backups weekly
0 0 * * 0 find /backups/ -mtime +7 -delete
```

2. **Update Process**

```bash
# Update dependencies
npm audit
npm update

# Test after updates
npm run test
npm run build
```

3. **Monitoring Alerts**

Configure alerts for:
- Error rate spikes
- High latency
- Memory usage
- CPU usage
- Disk space
- SSL certificate expiration

## Rollback Procedure

1. **Quick Rollback**

```bash
# Tag releases
git tag v1.0.0

# Rollback to previous version
git checkout v0.9.0
npm ci
npm run build
```

2. **Database Rollback**

```sql
-- Create restore point
CREATE RESTORE POINT my_restore_point;

-- Rollback if needed
ROLLBACK TO RESTORE POINT my_restore_point;
```

## Support

For deployment support:
1. Check the troubleshooting guide
2. Review logs
3. Contact support team
4. Open GitHub issue
