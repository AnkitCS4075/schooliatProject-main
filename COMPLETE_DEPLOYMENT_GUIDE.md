# SchooliAt Complete Deployment Guide - Single VPS

Complete guide for deploying **Landing Page**, **Dashboard**, and **Backend API** on a single Hostinger VPS (KVM 4) with **Staging and Production** environments

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Hostinger VPS (KVM 4)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Landing    │  │  Dashboard   │  │   Backend    │    │
│  │  (Static)    │  │  Staging     │  │   Staging    │    │
│  │  Port: -     │  │  Port: 3003  │  │  Port: 3001  │    │
│  │  Nginx       │  │  PM2         │  │  PM2         │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Dashboard   │  │   Backend    │  │  PostgreSQL  │    │
│  │  Production  │  │  Production  │  │  (Single)    │    │
│  │  Port: 3002  │  │  Port: 3000  │  │  - staging   │    │
│  │  PM2         │  │  PM2         │  │  - production │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │    Redis     │  │    MinIO     │                       │
│  │  (Single)    │  │  (Single)    │                       │
│  │  DB 0: Stag  │  │  - staging   │                       │
│  │  DB 1: Prod  │  │  - production│                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Nginx (Reverse Proxy)                  │  │
│  │  Production:                                        │  │
│  │  - schooliat.com → Landing                         │  │
│  │  - app.schooliat.com → Dashboard (3002)           │  │
│  │  - api.schooliat.com → Backend (3000)             │  │
│  │  Staging:                                          │  │
│  │  - staging-app.schooliat.com → Dashboard (3003)   │  │
│  │  - staging-api.schooliat.com → Backend (3001)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Install Required Services](#install-required-services)
4. [Database Setup](#database-setup)
5. [Application Directory Structure](#application-directory-structure)
6. [Backend API Setup](#backend-api-setup)
7. [Dashboard Setup](#dashboard-setup)
8. [Landing Page Setup](#landing-page-setup)
9. [Nginx Configuration](#nginx-configuration)
10. [PM2 Process Management](#pm2-process-management)
11. [SSL Certificate Setup](#ssl-certificate-setup)
12. [Environment Variables](#environment-variables)
13. [GitHub Actions CI/CD](#github-actions-cicd)
14. [Resource Optimization](#resource-optimization)
15. [Monitoring & Maintenance](#monitoring--maintenance)
16. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Hostinger VPS KVM 4 (4GB RAM, 2 CPU cores)
- Domain names configured:
  - **Production:**
    - `schooliat.com` → Landing page
    - `app.schooliat.com` → Dashboard
    - `api.schooliat.com` → Backend API
  - **Staging:**
    - `staging-app.schooliat.com` → Dashboard
    - `staging-api.schooliat.com` → Backend API
- GitHub repository access
- SSH key pair for VPS access
- Basic knowledge of Linux commands

**Note:** This guide uses a **Hybrid Approach** for environment separation:
- **PostgreSQL**: Separate databases (same instance)
  - `schooliat_staging` - Staging database
  - `schooliat_production` - Production database
- **Redis**: Separate DB numbers (same instance)
  - DB 0 - Staging
  - DB 1 - Production
- **MinIO**: Separate buckets (same instance)
  - `schooliat-files-staging` - Staging bucket
  - `schooliat-files-production` - Production bucket
- **Applications**: Separate ports and directories
  - Backend: Port 3000 (production), 3001 (staging)
  - Dashboard: Port 3002 (production), 3003 (staging)
  - Landing: Static files served by Nginx (production only)
ddd
This approach provides good isolation while efficiently using VPS resources.

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

### 3. Setup SSH Keys (Optional)

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS (if using key-based auth)
ssh-copy-id root@your-vps-ip

# Test connection
ssh root@your-vps-ip
```

**Note:** We're using root user for deployment. For production, consider creating a non-root user later for better security.

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
ufw allow 3000/tcp  # Backend Production
ufw allow 3001/tcp  # Backend Staging
ufw allow 3002/tcp  # Dashboard Production
ufw allow 3003/tcp  # Dashboard Staging

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
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should be 20.19.0 or higher
npm --version
```

### 2. Install PostgreSQL 16

```bash
# Add PostgreSQL repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update

# Install PostgreSQL
apt install -y postgresql-16 postgresql-contrib-16

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Verify installation
systemctl status postgresql
```

### 3. Install Redis 7

```bash
# Install Redis
apt install -y redis-server

# Configure Redis
nano /etc/redis/redis.conf
# Set: requirepass your_redis_password_here
# Set: bind 127.0.0.1

# Start and enable Redis
systemctl start redis-server
systemctl enable redis-server

# Verify installation
systemctl status redis-server
redis-cli ping  # Should return PONG
```

### 4. Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the instructions shown

# Verify installation
pm2 --version
```

### 5. Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify installation
systemctl status nginx
```

---

## Database Setup

### 1. Create PostgreSQL Databases (Staging & Production)

```bash
# Switch to postgres user
su - postgres
psql

# Create databases for both environments
CREATE DATABASE schooliat_staging;
CREATE DATABASE schooliat_production;

# Create users (optional, or use postgres user)
CREATE USER schooliat_staging_user WITH PASSWORD 'your_staging_password';
CREATE USER schooliat_production_user WITH PASSWORD 'your_production_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE schooliat_staging TO schooliat_staging_user;
GRANT ALL PRIVILEGES ON DATABASE schooliat_production TO schooliat_production_user;

# Or use single user for both (simpler)
CREATE USER schooliat_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE schooliat_staging TO schooliat_user;
GRANT ALL PRIVILEGES ON DATABASE schooliat_production TO schooliat_user;

# Exit PostgreSQL
\q
```

### 2. Configure Redis (Separate DB Numbers)

```bash
# Redis uses different database numbers for separation
# Staging will use DB 0 (default)
# Production will use DB 1

# Test Redis connection
redis-cli ping

# Test different databases
redis-cli -n 0 ping  # Staging
redis-cli -n 1 ping  # Production
```

### 3. Setup MinIO Buckets (Separate Buckets)

```bash
# Install MinIO client (if not already installed)
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/

# Configure MinIO alias
mc alias set myminio http://localhost:9000 minioadmin minioadmin123

# Create separate buckets for staging and production
mc mb myminio/schooliat-files-staging
mc mb myminio/schooliat-files-production

# Set bucket policies (optional)
mc anonymous set download myminio/schooliat-files-staging
mc anonymous set download myminio/schooliat-files-production

# Verify buckets
mc ls myminio
```

### 4. Configure PostgreSQL

```bash
# Edit PostgreSQL config
nano /etc/postgresql/16/main/postgresql.conf

# Set listen_addresses (if needed)
# listen_addresses = 'localhost'

# Tune for 4GB RAM (see Resource Optimization section)

# Edit pg_hba.conf for authentication
nano /etc/postgresql/16/main/pg_hba.conf

# Restart PostgreSQL
systemctl restart postgresql

# Verify both databases exist
psql -U schooliat_user -l | grep schooliat
```

---

## Application Directory Structure

### Create Directory Structure (Staging & Production)

```bash
# Create main application directory (using root home or /opt)
mkdir -p /opt/schooliat

# Create structure for each application and environment
mkdir -p /opt/schooliat/backend/{staging,production}/{current,releases,shared/{logs,uploads,files}}
mkdir -p /opt/schooliat/dashboard/{staging,production}/{current,releases,shared/{logs}}
mkdir -p /opt/schooliat/landing/{current,releases}

# Create shared directories
mkdir -p /opt/schooliat/shared/{backups,logs}
```

### Clone Repository

```bash
# Clone repository
cd /opt/schooliat
git clone https://github.com/your-username/schooliat-repo.git repo

# Create initial symlinks for production
ln -s repo/Backend backend/production/current
ln -s repo/dashboard dashboard/production/current
ln -s repo/landing landing/current

# Create symlinks for staging (can use same repo or separate branch)
ln -s repo/Backend backend/staging/current
ln -s repo/dashboard dashboard/staging/current

# Or clone develop branch for staging
cd /opt/schooliat
git clone -b develop https://github.com/your-username/schooliat-repo.git repo-staging
ln -s repo-staging/Backend backend/staging/current
ln -s repo-staging/dashboard dashboard/staging/current
```

---

## Backend API Setup

### Production Backend

#### 1. Install Dependencies

```bash
cd /opt/schooliat/backend/production/current
npm ci --production
```

#### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

#### 3. Run Database Migrations

```bash
# Set database URL temporarily
export DATABASE_URL="postgresql://schooliat_user:password@localhost:5432/schooliat_production"

# Run migrations
npm run prisma:migrate:deploy

# Verify
npm run prisma:migrate:status
```

#### 4. Seed Database (Optional - Only for initial setup)

```bash
npm run seed
```

### Staging Backend

#### 1. Install Dependencies

```bash
cd /opt/schooliat/backend/staging/current
npm ci --production
```

#### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

#### 3. Run Database Migrations

```bash
# Set database URL temporarily
export DATABASE_URL="postgresql://schooliat_user:password@localhost:5432/schooliat_staging"

# Run migrations
npm run prisma:migrate:deploy

# Verify
npm run prisma:migrate:status
```

#### 4. Seed Database (Optional - For testing)

```bash
npm run seed
```

---

## Dashboard Setup

### Production Dashboard

#### 1. Install Dependencies

```bash
cd /opt/schooliat/dashboard/production/current
# Note: Install all dependencies (including devDependencies) as Next.js build requires TypeScript and other build tools
npm ci
```

#### 2. Build Dashboard

```bash
# Build the Next.js application
npm run build
```

#### 3. Verify Build

```bash
# Test the build locally (optional)
npm start
# Should start on configured port
# Press Ctrl+C to stop
```

### Staging Dashboard

#### 1. Install Dependencies

```bash
cd /opt/schooliat/dashboard/staging/current
# Note: Install all dependencies (including devDependencies) as Next.js build requires TypeScript and other build tools
npm ci
```

#### 2. Build Dashboard

```bash
# Build the Next.js application
npm run build
```

#### 3. Verify Build

```bash
# Test the build locally (optional)
npm start
# Press Ctrl+C to stop
```

---

## Landing Page Setup

### 1. Install Dependencies

```bash
cd /opt/schooliat/landing/current
npm ci --production
```

### 2. Build Landing Page (Static Export)

```bash
# Build static export
npm run build

# The output will be in the 'out' directory
# Verify the build
ls -la out/
```

### 3. Copy to Nginx Directory

```bash
# Copy static files to a location Nginx can serve
mkdir -p /var/www/schooliat-landing
cp -r out/* /var/www/schooliat-landing/
chown -R www-data:www-data /var/www/schooliat-landing
```

---

## Nginx Configuration

### 1. Landing Page Configuration

```bash
nano /etc/nginx/sites-available/schooliat-landing
```

Add:

```nginx
server {
    listen 80;
    server_name schooliat.com www.schooliat.com;

    root /var/www/schooliat-landing;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Dashboard Configuration (Production)

```bash
nano /etc/nginx/sites-available/schooliat-dashboard
```

Add:

```nginx
server {
    listen 80;
    server_name app.schooliat.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3002/health;
        access_log off;
    }
}
```

### 3. Dashboard Configuration (Staging)

```bash
nano /etc/nginx/sites-available/schooliat-dashboard-staging
```

Add:

```nginx
server {
    listen 80;
    server_name staging-app.schooliat.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3003/health;
        access_log off;
    }
}
```

### 4. Backend API Configuration (Production)

```bash
nano /etc/nginx/sites-available/schooliat-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.schooliat.com;

    # Increase body size for file uploads
    client_max_body_size 50M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### 5. Backend API Configuration (Staging)

```bash
nano /etc/nginx/sites-available/schooliat-api-staging
```

Add:

```nginx
server {
    listen 80;
    server_name staging-api.schooliat.com;

    # Increase body size for file uploads
    client_max_body_size 50M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }

    # Rate limiting (more lenient for staging)
    limit_req_zone $binary_remote_addr zone=api_staging_limit:10m rate=20r/s;
    limit_req zone=api_staging_limit burst=40 nodelay;
}
```

### 6. Enable Sites

```bash
# Create symbolic links for production
ln -s /etc/nginx/sites-available/schooliat-landing /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/schooliat-dashboard /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/schooliat-api /etc/nginx/sites-enabled/

# Create symbolic links for staging
ln -s /etc/nginx/sites-available/schooliat-dashboard-staging /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/schooliat-api-staging /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## PM2 Process Management

### 1. Create PM2 Ecosystem File (Staging & Production)

Create `/opt/schooliat/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    // Backend Production
    {
      name: 'schooliat-backend-production',
      script: './backend/production/current/src/server.js',
      cwd: '/opt/schooliat',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './backend/production/shared/logs/error.log',
      out_file: './backend/production/shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '800M',
      watch: false,
    },
    // Backend Staging
    {
      name: 'schooliat-backend-staging',
      script: './backend/staging/current/src/server.js',
      cwd: '/opt/schooliat',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      error_file: './backend/staging/shared/logs/error.log',
      out_file: './backend/staging/shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '800M',
      watch: false,
    },
    // Dashboard Production
    {
      name: 'schooliat-dashboard-production',
      script: './dashboard/production/current/node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '/opt/schooliat/dashboard/production/current',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: '../shared/logs/error.log',
      out_file: '../shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '600M',
      watch: false,
    },
    // Dashboard Staging
    {
      name: 'schooliat-dashboard-staging',
      script: './dashboard/staging/current/node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/opt/schooliat/dashboard/staging/current',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 3003,
      },
      error_file: '../shared/logs/error.log',
      out_file: '../shared/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '600M',
      watch: false,
    },
  ],
};
```

### 2. Start Applications with PM2

```bash
# Start all applications
cd /opt/schooliat
pm2 start ecosystem.config.js

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
pm2 logs schooliat-backend-production
pm2 logs schooliat-backend-staging
pm2 logs schooliat-dashboard-production
pm2 logs schooliat-dashboard-staging
pm2 logs  # All logs

# Restart applications
pm2 restart schooliat-backend-production
pm2 restart schooliat-backend-staging
pm2 restart schooliat-dashboard-production
pm2 restart schooliat-dashboard-staging
pm2 restart all

# Restart by environment
pm2 restart all --update-env  # Restart all with updated env

# Stop applications
pm2 stop schooliat-backend-production
pm2 stop schooliat-backend-staging

# Monitor
pm2 monit
```

---

## SSL Certificate Setup

### 1. Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificates

```bash
# Production domains
certbot --nginx -d schooliat.com -d www.schooliat.com
certbot --nginx -d app.schooliat.com
certbot --nginx -d api.schooliat.com

# Staging domains
certbot --nginx -d staging-app.schooliat.com
certbot --nginx -d staging-api.schooliat.com

# Follow the prompts to complete the setup
```

### 3. Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Certbot automatically sets up renewal
systemctl status certbot.timer
```

---

## Environment Variables

### 1. Backend Production Environment Variables

```bash
nano /opt/schooliat/backend/production/shared/.env
```

Add:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_production
DATABASE_DIRECT_URL=postgresql://schooliat_user:password@localhost:5432/schooliat_production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=1
JWT_SECRET=your_production_jwt_secret_here_very_secure
JWT_EXPIRATION_TIME=48
FILE_STORAGE=s3
AWS_S3_BUCKET=schooliat-files-production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
MINIO_ENDPOINT=http://localhost:9000
LOG_LEVEL=info
ALLOWED_ORIGINS=https://schooliat.com,https://www.schooliat.com,https://app.schooliat.com
API_URL=https://api.schooliat.com
```

### 2. Backend Staging Environment Variables

```bash
nano /opt/schooliat/backend/staging/shared/.env
```

Add:

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
FILE_STORAGE=s3
AWS_S3_BUCKET=schooliat-files-staging
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
MINIO_ENDPOINT=http://localhost:9000
LOG_LEVEL=debug
ALLOWED_ORIGINS=https://staging-app.schooliat.com,https://staging-api.schooliat.com
API_URL=https://staging-api.schooliat.com
```

### 3. Dashboard Production Environment Variables

```bash
nano /opt/schooliat/dashboard/production/shared/.env
```

Add:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.schooliat.com
# Add other Next.js public environment variables
```

### 4. Dashboard Staging Environment Variables

```bash
nano /opt/schooliat/dashboard/staging/shared/.env
```

Add:

```env
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://staging-api.schooliat.com
# Add other Next.js public environment variables
```

### 5. Link Environment Files

```bash
# Backend Production
ln -s /opt/schooliat/backend/production/shared/.env /opt/schooliat/backend/production/current/.env

# Backend Staging
ln -s /opt/schooliat/backend/staging/shared/.env /opt/schooliat/backend/staging/current/.env

# Dashboard Production
ln -s /opt/schooliat/dashboard/production/shared/.env /opt/schooliat/dashboard/production/current/.env

# Dashboard Staging
ln -s /opt/schooliat/dashboard/staging/shared/.env /opt/schooliat/dashboard/staging/current/.env
```

### 6. Secure Environment Files

```bash
chmod 600 /opt/schooliat/backend/production/shared/.env
chmod 600 /opt/schooliat/backend/staging/shared/.env
chmod 600 /opt/schooliat/dashboard/production/shared/.env
chmod 600 /opt/schooliat/dashboard/staging/shared/.env
```

---

## GitHub Actions CI/CD

### 1. Create GitHub Secrets

Go to GitHub repository → Settings → Secrets and variables → Actions

Add secrets:
- `VPS_HOST` - VPS IP address
- `VPS_USER` - SSH username (root)
- `VPS_SSH_KEY` - Private SSH key
- **Production:**
  - `PRODUCTION_DATABASE_URL` - Production database URL
  - `PRODUCTION_JWT_SECRET` - Production JWT secret
  - `PRODUCTION_REDIS_PASSWORD` - Redis password
- **Staging:**
  - `STAGING_DATABASE_URL` - Staging database URL
  - `STAGING_JWT_SECRET` - Staging JWT secret
  - `STAGING_REDIS_PASSWORD` - Redis password
- Other required secrets (AWS keys, etc.)

### 2. Create Workflow for Staging (develop branch)

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
      
      # Deploy Backend Staging
      - name: Deploy Backend Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/schooliat/backend/staging/current
            git pull origin develop
            npm ci --production
            npm run prisma:generate
            DATABASE_URL="${{ secrets.STAGING_DATABASE_URL }}" npm run prisma:migrate:deploy
            pm2 restart schooliat-backend-staging
      
      # Deploy Dashboard Staging
      - name: Deploy Dashboard Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/schooliat/dashboard/staging/current
            git pull origin develop
            npm ci --production
            npm run build
            pm2 restart schooliat-dashboard-staging
```

### 3. Create Workflow for Production (main branch)

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
      
      # Deploy Backend Production
      - name: Deploy Backend Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/schooliat/backend/production/current
            git pull origin main
            npm ci --production
            npm run prisma:generate
            # Backup database before migration
            pg_dump -U schooliat_user schooliat_production > /opt/schooliat/shared/backups/pre-migration-$(date +%Y%m%d-%H%M%S).sql
            DATABASE_URL="${{ secrets.PRODUCTION_DATABASE_URL }}" npm run prisma:migrate:deploy
            pm2 restart schooliat-backend-production
      
      # Deploy Dashboard Production
      - name: Deploy Dashboard Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/schooliat/dashboard/production/current
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart schooliat-dashboard-production
      
      # Deploy Landing
      - name: Deploy Landing
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/schooliat/landing/current
            git pull origin main
            npm ci --production
            npm run build
            cp -r out/* /var/www/schooliat-landing/
            chown -R www-data:www-data /var/www/schooliat-landing
            systemctl reload nginx
```

---

## Resource Optimization

### 1. Memory Management

Given KVM 4 has 4GB RAM:

```bash
# Monitor memory usage
free -h
pm2 monit

# Adjust PM2 memory limits in ecosystem.config.js
# Backend: max_memory_restart: '800M'
# Dashboard: max_memory_restart: '600M'
```

### 2. PostgreSQL Tuning

```bash
nano /etc/postgresql/16/main/postgresql.conf

# Adjust for 4GB RAM:
shared_buffers = 1GB
effective_cache_size = 2GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB

# Restart PostgreSQL
systemctl restart postgresql
```

### 3. Swap Space (If Needed)

```bash
# Check current swap
free -h

# Create swap file (2GB)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

---

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Production
curl https://api.schooliat.com/health
curl https://app.schooliat.com/health
curl https://schooliat.com

# Staging
curl https://staging-api.schooliat.com/health
curl https://staging-app.schooliat.com/health
```

### 2. Monitor Logs

```bash
# PM2 logs
pm2 logs  # All logs
pm2 logs schooliat-backend-production
pm2 logs schooliat-backend-staging
pm2 logs schooliat-dashboard-production
pm2 logs schooliat-dashboard-staging

# Application logs
tail -f /opt/schooliat/backend/production/shared/logs/out.log
tail -f /opt/schooliat/backend/staging/shared/logs/out.log
tail -f /opt/schooliat/dashboard/production/shared/logs/out.log
tail -f /opt/schooliat/dashboard/staging/shared/logs/out.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

### 3. Database Backups

```bash
# Create backup script
nano /opt/schooliat/shared/backup-database.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR=/opt/schooliat/shared/backups
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup staging
pg_dump -U schooliat_user schooliat_staging > $BACKUP_DIR/staging-$DATE.sql
gzip $BACKUP_DIR/staging-$DATE.sql

# Backup production
pg_dump -U schooliat_user schooliat_production > $BACKUP_DIR/production-$DATE.sql
gzip $BACKUP_DIR/production-$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: staging-$DATE.sql.gz, production-$DATE.sql.gz"
```

```bash
# Make executable
chmod +x /opt/schooliat/shared/backup-database.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/schooliat/shared/backup-database.sh
```

---

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 status
pm2 status
pm2 logs

# Check if ports are in use
lsof -i :3000  # Backend Production
lsof -i :3001  # Backend Staging
lsof -i :3002  # Dashboard Production
lsof -i :3003  # Dashboard Staging

# Restart specific application
pm2 restart schooliat-backend-production
pm2 restart schooliat-backend-staging
pm2 restart schooliat-dashboard-production
pm2 restart schooliat-dashboard-staging

# Restart all
pm2 restart all
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# Check status
systemctl status nginx

# Reload
systemctl reload nginx

# Check logs
tail -f /var/log/nginx/error.log
```

### Database Issues

```bash
# Test database connections
psql -U schooliat_user -d schooliat_staging -h localhost
psql -U schooliat_user -d schooliat_production -h localhost

# Check PostgreSQL
systemctl status postgresql

# Check logs
tail -f /var/log/postgresql/postgresql-16-main.log

# List all databases
psql -U schooliat_user -l
```

### Memory Issues

```bash
# Check memory
free -h
pm2 monit

# Restart services if needed
pm2 restart all
```

---

## Quick Reference Commands

```bash
# Application Management
pm2 start ecosystem.config.js
pm2 restart all
pm2 restart schooliat-backend-production
pm2 restart schooliat-backend-staging
pm2 logs
pm2 monit
pm2 status

# Services
systemctl status postgresql
systemctl status redis-server
systemctl status nginx
systemctl reload nginx

# Database
psql -U schooliat_user -d schooliat_staging
psql -U schooliat_user -d schooliat_production
pg_dump -U schooliat_user schooliat_staging > backup-staging.sql
pg_dump -U schooliat_user schooliat_production > backup-production.sql

# Redis (test different DBs)
redis-cli -n 0 ping  # Staging
redis-cli -n 1 ping  # Production

# Logs
pm2 logs
tail -f /opt/schooliat/backend/production/shared/logs/out.log
tail -f /opt/schooliat/backend/staging/shared/logs/out.log
tail -f /var/log/nginx/error.log

# Deployment - Production
cd /opt/schooliat/backend/production/current && git pull && npm ci --production && pm2 restart schooliat-backend-production
cd /opt/schooliat/dashboard/production/current && git pull && npm ci && npm run build && pm2 restart schooliat-dashboard-production
cd /opt/schooliat/landing/current && git pull && npm ci --production && npm run build && cp -r out/* /var/www/schooliat-landing/

# Deployment - Staging
cd /opt/schooliat/backend/staging/current && git pull && npm ci --production && pm2 restart schooliat-backend-staging
cd /opt/schooliat/dashboard/staging/current && git pull && npm ci && npm run build && pm2 restart schooliat-dashboard-staging
```

---

## Deployment Checklist

- [ ] VPS setup complete
- [ ] All services installed and running
- [ ] Databases created (staging & production)
- [ ] Redis configured (DB 0 for staging, DB 1 for production)
- [ ] MinIO buckets created (staging & production)
- [ ] Backend API deployed (staging & production)
- [ ] Dashboard built and running (staging & production)
- [ ] Landing page built and served by Nginx
- [ ] Nginx configured for all applications (staging & production)
- [ ] SSL certificates installed for all domains
- [ ] Environment variables configured for all environments
- [ ] PM2 processes running (4 processes total)
- [ ] Health checks passing for all environments
- [ ] CI/CD pipeline configured (staging & production workflows)
- [ ] Backups configured (both databases)
- [ ] Monitoring setup

---

## Environment Separation Summary

### Hybrid Approach Configuration

This deployment uses a **Hybrid Approach** to separate staging and production environments on a single VPS:

#### Database Separation (PostgreSQL)
- **Single PostgreSQL instance** running on port 5432
- **Two separate databases:**
  - `schooliat_staging` - All staging data
  - `schooliat_production` - All production data
- **Connection strings:**
  - Staging: `postgresql://user:pass@localhost:5432/schooliat_staging`
  - Production: `postgresql://user:pass@localhost:5432/schooliat_production`

#### Cache Separation (Redis)
- **Single Redis instance** running on port 6379
- **Two separate database numbers:**
  - DB 0 - Staging cache
  - DB 1 - Production cache
- **Connection:**
  - Staging: `REDIS_DB=0`
  - Production: `REDIS_DB=1`

#### File Storage Separation (MinIO)
- **Single MinIO instance** running on port 9000
- **Two separate buckets:**
  - `schooliat-files-staging` - Staging files
  - `schooliat-files-production` - Production files
- **Same endpoint, different buckets**

#### Application Separation
- **Separate ports:**
  - Backend: 3000 (production), 3001 (staging)
  - Dashboard: 3002 (production), 3003 (staging)
- **Separate directories:**
  - `/opt/schooliat/backend/production/`
  - `/opt/schooliat/backend/staging/`
  - `/opt/schooliat/dashboard/production/`
  - `/opt/schooliat/dashboard/staging/`
- **Separate PM2 processes:**
  - `schooliat-backend-production`
  - `schooliat-backend-staging`
  - `schooliat-dashboard-production`
  - `schooliat-dashboard-staging`

#### Domain Separation
- **Production:**
  - `schooliat.com` → Landing
  - `app.schooliat.com` → Dashboard
  - `api.schooliat.com` → Backend
- **Staging:**
  - `staging-app.schooliat.com` → Dashboard
  - `staging-api.schooliat.com` → Backend

### Benefits of This Approach

✅ **Resource Efficient**: Single service instances save memory  
✅ **Good Isolation**: Separate databases, Redis DBs, and buckets  
✅ **Easy Management**: All services in one place  
✅ **Cost Effective**: No need for separate VPS instances  
✅ **Simple Deployment**: Single VPS, unified monitoring  

### Important Notes

- **Database Backups**: Always backup both databases separately
- **Migrations**: Run migrations on staging first, then production
- **Environment Variables**: Keep staging and production `.env` files separate
- **Secrets**: Use different JWT secrets for staging and production
- **Monitoring**: Monitor both environments separately

---

**Last Updated:** 2025-01-30  
**Version:** 2.0 (Updated with Hybrid Staging/Production Setup)

