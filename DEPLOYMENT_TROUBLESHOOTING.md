# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. White Screen After Few Seconds

**Problem**: Website works initially but shows white screen after a few seconds.

**Causes**:
- Server crashes due to memory issues
- Database connection timeout
- Uncaught exceptions in background processes
- Port conflicts

**Solutions**:

#### Check Server Status
```bash
# Check if process is running
pm2 list

# Check server logs
pm2 logs jaberco-ecommerce

# Check error logs
pm2 logs jaberco-ecommerce --err

# Monitor in real-time
pm2 monit
```

#### Restart the Application
```bash
# Stop the application
pm2 stop jaberco-ecommerce

# Start the application
pm2 start ecosystem.config.js

# Or restart
pm2 restart jaberco-ecommerce
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
node_args: '--max-old-space-size=2048'
```

### 2. Port Configuration Issues

**Problem**: Server starts but is not accessible.

**Solution**:
- Ensure port 5000 is open in firewall
- Check if another process is using port 5000
- Verify nginx/Apache proxy configuration

```bash
# Check port usage
sudo netstat -tulpn | grep :5000

# Check if process is listening
sudo lsof -i :5000
```

### 3. Database Connection Issues

**Problem**: Database operations fail after deployment.

**Solution**:
- Verify DATABASE_URL environment variable
- Check database server status
- Ensure database credentials are correct

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### 4. Environment Variables

**Problem**: Missing or incorrect environment variables.

**Solution**:
Create `.env` file with required variables:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SENDGRID_API_KEY=your_sendgrid_key
```

### 5. Build Issues

**Problem**: Application fails to build or start.

**Solution**:
```bash
# Clean build
rm -rf dist/
rm -rf node_modules/
npm install

# Build the application
npm run build

# Test production build
npm start
```

### 6. Static Files Not Loading

**Problem**: CSS, JS, or images not loading.

**Solution**:
- Ensure build process completed successfully
- Check static file paths in production
- Verify web server configuration

### 7. Session Issues

**Problem**: Users get logged out or session problems.

**Solution**:
- Check session storage configuration
- Ensure session secret is set
- Verify session store is accessible

## Monitoring Commands

```bash
# Real-time monitoring
pm2 monit

# Check application status
pm2 status

# View logs
pm2 logs --lines 50

# CPU and memory usage
pm2 show jaberco-ecommerce

# Restart if needed
pm2 restart jaberco-ecommerce
```

## Emergency Recovery

If the application is completely down:

1. **Stop everything**:
   ```bash
   pm2 stop all
   pm2 delete all
   ```

2. **Clean restart**:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **If still failing**:
   ```bash
   # Manual start for debugging
   NODE_ENV=production node dist/index.js
   ```

## Performance Optimization

1. **Enable gzip compression**
2. **Optimize database queries**
3. **Use CDN for static assets**
4. **Monitor memory usage**
5. **Regular database maintenance**

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database credentials encrypted
- [ ] Firewall configured
- [ ] Regular security updates

## Contact Support

If issues persist, provide:
- Server logs from `pm2 logs`
- Error messages
- Steps to reproduce
- Server specifications
- Environment details