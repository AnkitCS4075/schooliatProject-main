# SchooliAt Backend - VPS Deployment Guide

Complete step-by-step guide for deploying SchooliAt backend to Hostinger VPS (Staging & Production)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Install Required Services](#install-required-services)
4. [Database Setup](#database-setup)
5. [Application Setup](#application-setup)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [PM2 Process Management](#pm2-process-management)
9. [GitHub Actions CI/CD](#github-actions-cicd)
10. [Environment Variables](#environment-variables)
11. [Deployment Process](#deployment-process)
12. [Monitoring & Maintenance](#monitoring--maintenance)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Hostinger VPS with root/sudo access
- Domain names configured:
  - Staging: `staging.schooliat.com` (or your subdomain)
  - Production: `api.schooliat.com` (or your domain)
- GitHub repository access
- SSH key pair for VPS access
- Basic knowledge of Linux commands

---

## VPS Initial Setup

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
# or
ssh root@your-vps-hostname
```

### 2. Update System

```bash
# Update package list
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential
```

### 3. Create Deployment User

```bash
# Create non-root user for deployment
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### 4. Setup SSH Keys

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS
ssh-copy-id deploy@your-vps-ip

# Test connection
ssh deploy@your-vps-ip
```

### 5. Configure Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow application ports (if not using Nginx reverse proxy)
ufw allow 3000/tcp  # Production
ufw allow 3001/tcp  # Staging

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Install Required Services

### 1. Install Node.js 20.19.0+

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be 20.19.0 or higher
npm --version
```

### 2. Install PostgreSQL 16

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL
sudo apt install -y postgresql-16 postgresql-contrib-16

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 3. Install Redis 7

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password_here
# Set: bind 127.0.0.1

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify installation
sudo systemctl status redis-server
redis-cli ping  # Should return PONG
```

### 4. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the instructions shown

# Verify installation
pm2 --version
```

### 5. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

---

## Database Setup

### 1. Create PostgreSQL Databases

```bash
# Switch to postgres user
sudo -u postgres psql

# Create databases
CREATE DATABASE schooliat_staging;
CREATE DATABASE schooliat_production;

# Create user (optional, or use postgres user)
CREATE USER schooliat_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE schooliat_staging TO schooliat_user;
GRANT ALL PRIVILEGES ON DATABASE schooliat_production TO schooliat_user;

# Exit PostgreSQL
\q
```

### 2. Configure PostgreSQL

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/16/main/postgresql.conf

# Set listen_addresses (if needed)
# listen_addresses = 'localhost'

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Test Database Connection

```bash
# Test connection
psql -U schooliat_user -d schooliat_staging -h localhost
# Enter password when prompted

# Exit
\q
```

---

## Application Setup

### 1. Create Application Directory Structure

```bash
# Create directories
mkdir -p ~/schooliat/{staging,production}/{current,releases,shared/{logs,uploads}}

# Create symlinks
cd ~/schooliat/staging
ln -s releases/$(date +%Y%m%d%H%M%S) current

cd ~/schooliat/production
ln -s releases/$(date +%Y%m%d%H%M%S) current
```

### 2. Clone Repository (Initial Setup)

```bash
# Clone repository to a temporary location
cd /tmp
git clone https://github.com/your-username/schooliat-repo.git

# Copy Backend to application directory
cp -r schooliat-repo/Backend ~/schooliat/staging/current
cp -r schooliat-repo/Backend ~/schooliat/production/current

# Or use symbolic link for easier updates
# ln -s ~/schooliat-repo/Backend ~/schooliat/staging/current
```

### 3. Install Application Dependencies

```bash
# Staging
cd ~/schooliat/staging/current
npm ci --production

# Production
cd ~/schooliat/production/current
npm ci --production
```

### 4. Generate Prisma Client

```bash
# Staging
cd ~/schooliat/staging/current
npm run prisma:generate

# Production
cd ~/schooliat/production/current
npm run prisma:generate
```

### 5. Run Database Migrations

```bash
# Staging
cd ~/schooliat/staging/current
DATABASE_URL="postgresql://schooliat_user:password@localhost:5432/schooliat_staging" npm run prisma:migrate:deploy

# Production (BE CAREFUL - backup first!)
cd ~/schooliat/production/current
DATABASE_URL="postgresql://schooliat_user:password@localhost:5432/schooliat_production" npm run prisma:migrate:deploy
```

---

## Nginx Configuration

### 1. Create Nginx Configuration for Staging

```bash
sudo nano /etc/nginx/sites-available/schooliat-staging
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name staging.schooliat.com;  # Replace with your staging domain

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

### 2. Create Nginx Configuration for Production

```bash
sudo nano /etc/nginx/sites-available/schooliat-production
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name api.schooliat.com;  # Replace with your production domain

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### 3. Enable Sites

```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/schooliat-staging /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/schooliat-production /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificates

```bash
# For Staging
sudo certbot --nginx -d staging.schooliat.com

# For Production
sudo certbot --nginx -d api.schooliat.com

# Follow the prompts to complete the setup
```

### 3. Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up renewal, but verify:
sudo systemctl status certbot.timer
```

### 4. Update Nginx Configurations

After SSL setup, Certbot will automatically update your Nginx configs. You can manually edit them:

```bash
sudo nano /etc/nginx/sites-available/schooliat-staging
sudo nano /etc/nginx/sites-available/schooliat-production
```

---

## PM2 Process Management

### 1. Create PM2 Ecosystem File

Create `~/schooliat/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'schooliat-staging',
      script: './staging/current/src/server.js',
      cwd: '/home/deploy/schooliat',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      error_file: './staging/shared/logs/error.log',
      out_file: './staging/shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
    },
    {
      name: 'schooliat-production',
      script: './production/current/src/server.js',
      cwd: '/home/deploy/schooliat',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './production/shared/logs/error.log',
      out_file: './production/shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      watch: false,
    },
  ],
};
```

### 2. Start Applications with PM2

```bash
# Start both applications
cd ~/schooliat
pm2 start ecosystem.config.js

# Or start individually
pm2 start ecosystem.config.js --only schooliat-staging
pm2 start ecosystem.config.js --only schooliat-production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs
pm2 monit
```

### 3. PM2 Useful Commands

```bash
# View logs
pm2 logs schooliat-staging
pm2 logs schooliat-production

# Restart applications
pm2 restart schooliat-staging
pm2 restart schooliat-production

# Stop applications
pm2 stop schooliat-staging
pm2 stop schooliat-production

# Delete applications
pm2 delete schooliat-staging
pm2 delete schooliat-production

# Monitor
pm2 monit
```

---

## Environment Variables

### 1. Create Environment Files

```bash
# Staging
nano ~/schooliat/staging/shared/.env
```

Add staging environment variables:

```env
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_staging
DATABASE_DIRECT_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_staging
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
JWT_SECRET=your_staging_jwt_secret_here
JWT_EXPIRATION_TIME=48
FILE_STORAGE=local
FILE_PATH=files
MINIO_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
LOG_LEVEL=debug
ALLOWED_ORIGINS=https://staging.schooliat.com
```

```bash
# Production
nano ~/schooliat/production/shared/.env
```

Add production environment variables (use secure values):

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_production
DATABASE_DIRECT_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
JWT_SECRET=your_production_jwt_secret_here_very_secure
JWT_EXPIRATION_TIME=48
FILE_STORAGE=s3
AWS_S3_BUCKET=your-s3-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
LOG_LEVEL=info
ALLOWED_ORIGINS=https://schooliat.com,https://www.schooliat.com
```

### 2. Link Environment Files

```bash
# Staging
ln -s ~/schooliat/staging/shared/.env ~/schooliat/staging/current/.env

# Production
ln -s ~/schooliat/production/shared/.env ~/schooliat/production/current/.env
```

### 3. Secure Environment Files

```bash
# Set proper permissions
chmod 600 ~/schooliat/staging/shared/.env
chmod 600 ~/schooliat/production/shared/.env
```

---

## GitHub Actions CI/CD

### 1. Create GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

- `VPS_HOST` - Your VPS IP address or hostname
- `VPS_USER` - SSH username (usually `deploy`)
- `VPS_SSH_KEY` - Your private SSH key (entire key including `-----BEGIN` and `-----END`)
- `STAGING_DATABASE_URL` - Staging database connection string
- `PRODUCTION_DATABASE_URL` - Production database connection string
- `STAGING_JWT_SECRET` - Staging JWT secret
- `PRODUCTION_JWT_SECRET` - Production JWT secret
- `STAGING_REDIS_PASSWORD` - Staging Redis password
- `PRODUCTION_REDIS_PASSWORD` - Production Redis password
- Other environment-specific secrets

### 2. Create GitHub Actions Workflow for Staging

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: Backend/package-lock.json
      
      - name: Install dependencies
        working-directory: Backend
        run: npm ci
      
      - name: Run tests
        working-directory: Backend
        run: npm test
        continue-on-error: true
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/schooliat/staging/current
            git pull origin develop
            npm ci --production
            npm run prisma:generate
            DATABASE_URL="${{ secrets.STAGING_DATABASE_URL }}" npm run prisma:migrate:deploy
            pm2 restart schooliat-staging
            pm2 logs schooliat-staging --lines 50
```

### 3. Create GitHub Actions Workflow for Production

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: Backend/package-lock.json
      
      - name: Install dependencies
        working-directory: Backend
        run: npm ci
      
      - name: Run tests
        working-directory: Backend
        run: npm test
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/schooliat/production/current
            git pull origin main
            npm ci --production
            npm run prisma:generate
            # Backup database before migration
            pg_dump -U schooliat_user schooliat_production > ~/backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql
            DATABASE_URL="${{ secrets.PRODUCTION_DATABASE_URL }}" npm run prisma:migrate:deploy
            pm2 restart schooliat-production
            pm2 logs schooliat-production --lines 50
```

---

## Deployment Process

### Manual Deployment (Alternative to CI/CD)

```bash
# SSH to VPS
ssh deploy@your-vps-ip

# Navigate to application
cd ~/schooliat/staging/current  # or production/current

# Pull latest code
git pull origin develop  # or main for production

# Install dependencies
npm ci --production

# Generate Prisma client
npm run prisma:generate

# Run migrations (staging only, production needs backup first!)
npm run prisma:migrate:deploy

# Restart application
pm2 restart schooliat-staging  # or schooliat-production

# Check logs
pm2 logs schooliat-staging --lines 50
```

### Production Deployment Checklist

- [ ] Backup production database
- [ ] Test on staging first
- [ ] Review changes
- [ ] Notify team
- [ ] Deploy during low-traffic period
- [ ] Monitor logs after deployment
- [ ] Verify health endpoints
- [ ] Check error rates
- [ ] Rollback plan ready

---

## Monitoring & Maintenance

### 1. Health Check Endpoints

Test your deployments:

```bash
# Staging
curl https://staging.schooliat.com/health

# Production
curl https://api.schooliat.com/health
```

### 2. Monitor Logs

```bash
# PM2 logs
pm2 logs

# Application logs
tail -f ~/schooliat/staging/shared/logs/out.log
tail -f ~/schooliat/production/shared/logs/out.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Database Backups

```bash
# Create backup script
nano ~/backup-database.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d-%H%M%S)

# Backup staging
pg_dump -U schooliat_user schooliat_staging > $BACKUP_DIR/staging-$DATE.sql

# Backup production
pg_dump -U schooliat_user schooliat_production > $BACKUP_DIR/production-$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup-database.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/deploy/backup-database.sh
```

### 4. System Monitoring

```bash
# Check system resources
htop
# or
top

# Check disk space
df -h

# Check memory
free -h

# Check PM2 status
pm2 status
pm2 monit
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs schooliat-staging

# Check if port is in use
sudo lsof -i :3001
sudo lsof -i :3000

# Restart PM2
pm2 restart all
```

### Database Connection Issues

```bash
# Test database connection
psql -U schooliat_user -d schooliat_staging -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R deploy:deploy ~/schooliat
chmod -R 755 ~/schooliat
```

---

## Quick Reference Commands

```bash
# Application Management
pm2 start ecosystem.config.js
pm2 restart schooliat-staging
pm2 restart schooliat-production
pm2 stop schooliat-staging
pm2 logs schooliat-staging
pm2 monit

# Database
psql -U schooliat_user -d schooliat_staging
pg_dump -U schooliat_user schooliat_staging > backup.sql

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx

# Services
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx

# Logs
pm2 logs
tail -f ~/schooliat/staging/shared/logs/out.log
sudo tail -f /var/log/nginx/error.log
```

---

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled for SSH
- [ ] Non-root user for deployment
- [ ] SSL certificates installed
- [ ] Environment variables secured (600 permissions)
- [ ] Database passwords strong
- [ ] Redis password set
- [ ] Regular security updates
- [ ] Fail2ban installed (optional but recommended)

---

## Next Steps

1. Complete all setup steps above
2. Test staging deployment
3. Verify all endpoints work
4. Test production deployment
5. Setup monitoring alerts
6. Document any custom configurations
7. Train team on deployment process

---

## Support

For issues or questions:
- Check application logs: `pm2 logs`
- Check Nginx logs: `/var/log/nginx/`
- Check system logs: `journalctl -xe`
- Review this guide for common issues

---

**Last Updated:** 2025-01-30
**Version:** 1.0

