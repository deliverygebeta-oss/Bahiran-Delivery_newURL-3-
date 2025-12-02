# Gebeta Frontend - Production Deployment Guide

## Prerequisites

- Ubuntu 20.04 or 22.04 VPS
- Root or sudo access
- Domain name pointed to your VPS IP
- Minimum 1GB RAM, 1 CPU core

## Deployment Options

### Option 1: Automated Deployment (Recommended)

1. **Upload project to VPS**
   ```bash
   scp -r . root@your-vps-ip:/var/www/gebeta-frontend
   ```

2. **SSH into your VPS**
   ```bash
   ssh root@your-vps-ip
   ```

3. **Make deployment script executable**
   ```bash
   cd /var/www/gebeta-frontend
   chmod +x deploy.sh
   ```

4. **Run deployment script**
   ```bash
   sudo ./deploy.sh
   ```

5. **Configure environment variables**
   ```bash
   cp .env.production.example .env.production
   nano .env.production  # Edit with your actual values
   ```

6. **Update Nginx configuration**
   ```bash
   nano nginx.conf  # Replace 'your-domain.com' with your actual domain
   ```

7. **Install SSL certificate**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

8. **Rebuild and restart**
   ```bash
   npm run build
   pm2 restart gebeta-frontend
   ```

### Option 2: Manual Deployment

#### Step 1: System Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx
```

#### Step 2: Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/gebeta-frontend
cd /var/www/gebeta-frontend

# Upload your project files or clone from git
# git clone your-repo-url .

# Install dependencies
npm ci --production=false

# Create environment file
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Build application
npm run build

# Create logs directory
mkdir -p logs
```

#### Step 3: PM2 Configuration

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd

# Follow the command output instructions
```

#### Step 4: Nginx Configuration

```bash
# Update nginx.conf with your domain
nano nginx.conf

# Copy configuration
sudo cp nginx.conf /etc/nginx/sites-available/gebeta-frontend
sudo ln -s /etc/nginx/sites-available/gebeta-frontend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 5: SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal with: sudo certbot renew --dry-run
```

#### Step 6: Firewall Configuration

```bash
# Allow Nginx and SSH
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Post-Deployment

### Verify Installation

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs gebeta-frontend

# Check Nginx status
sudo systemctl status nginx

# Test application
curl http://localhost:5000
```

### Useful Commands

```bash
# Restart application
pm2 restart gebeta-frontend

# Stop application
pm2 stop gebeta-frontend

# View real-time logs
pm2 logs gebeta-frontend --lines 100

# Monitor resources
pm2 monit

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/gebeta-frontend-access.log
sudo tail -f /var/log/nginx/gebeta-frontend-error.log
```

## Updating the Application

```bash
cd /var/www/gebeta-frontend

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production=false

# Rebuild
npm run build

# Restart application
pm2 restart gebeta-frontend
```

## Environment Variables

Required environment variables in `.env.production`:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL
- `VITE_SUPABASE_URL` - Supabase project URL (if using)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (if using)

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs gebeta-frontend --err

# Check if port 5000 is in use
sudo lsof -i :5000
```

### Nginx errors
```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### SSL certificate issues
```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### High memory usage
```bash
# Restart PM2 process
pm2 restart gebeta-frontend

# Check memory usage
pm2 monit
```

## Security Recommendations

1. **Keep system updated**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

2. **Configure fail2ban**
   ```bash
   sudo apt-get install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Disable root SSH login**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart ssh
   ```

4. **Use SSH keys instead of passwords**

5. **Regular backups**
   - Backup application files
   - Backup environment variables
   - Backup Nginx configuration

## Monitoring

### Setup monitoring with PM2 Plus (optional)
```bash
pm2 link your-secret-key your-public-key
```

### Basic monitoring
```bash
# CPU and Memory usage
pm2 monit

# Application logs
pm2 logs gebeta-frontend

# System resources
htop
```

## Support

For issues or questions:
- Check logs: `pm2 logs gebeta-frontend`
- Review Nginx logs: `sudo tail -f /var/log/nginx/gebeta-frontend-error.log`
- Contact: info@gebeta-tech.com
