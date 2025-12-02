#!/bin/bash

# Gebeta Frontend Deployment Script for VPS
# This script automates the deployment process

set -e

echo "🚀 Starting Gebeta Frontend Deployment..."

# Configuration
APP_DIR="/var/www/gebeta-frontend"
REPO_URL="your-git-repo-url"  # Update this with your actual repo URL
BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt-get update -qq
print_success "System packages updated"

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js already installed ($(node -v))"
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get install -y nginx
    systemctl enable nginx
    print_success "Nginx installed"
else
    print_success "Nginx already installed"
fi

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or pull repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin $BRANCH
else
    echo "📥 Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi
print_success "Code updated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Build application
echo "🔨 Building application..."
npm run build
print_success "Build completed"

# Create logs directory
mkdir -p logs

# Stop PM2 process if running
if pm2 list | grep -q "gebeta-frontend"; then
    echo "🛑 Stopping existing PM2 process..."
    pm2 stop gebeta-frontend
    pm2 delete gebeta-frontend
fi

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
print_success "Application started"

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root
print_success "PM2 startup configured"

# Setup Nginx configuration
echo "⚙️  Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/gebeta-frontend
ln -sf /etc/nginx/sites-available/gebeta-frontend /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
print_success "Nginx configured and reloaded"

# Setup UFW firewall
echo "🔒 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
print_success "Firewall configured"

# Display status
echo ""
echo "═══════════════════════════════════════"
echo "🎉 Deployment completed successfully!"
echo "═══════════════════════════════════════"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "📊 View logs: pm2 logs gebeta-frontend"
echo "🔄 Restart app: pm2 restart gebeta-frontend"
echo "🛑 Stop app: pm2 stop gebeta-frontend"
echo ""
echo "⚠️  Next steps:"
echo "1. Update nginx.conf with your domain name"
echo "2. Install SSL certificate with: sudo certbot --nginx -d your-domain.com"
echo "3. Create .env.production file with your environment variables"
echo ""
