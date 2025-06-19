# Deployment Fix Guide for WSA Server

## Issue Resolution
The deployment script has been updated to fix the missing build scripts and configuration issues.

## Fixed Issues:
1. Added missing `build:frontend` script to package.json
2. Updated PM2 configuration to use correct port (5000) and built files
3. Added `--legacy-peer-deps` flag to handle npm dependency warnings
4. Fixed application name references in deployment scripts

## Updated Deployment Process

### 1. Re-run the deployment script:
```bash
./deploy-github.sh
```

### 2. If the script stops at "Press Enter after configuring .env file":
Since you're using AWS Parameter Store, simply press Enter to continue.

### 3. Monitor the build process:
The script will now properly build both frontend and backend components.

### 4. Verify deployment:
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs jaberco-app

# Test the application
curl http://localhost:5000
```

## AWS Parameter Store Configuration
Make sure your AWS credentials are set:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

## Troubleshooting

### If build still fails:
```bash
# Clean install
rm -rf node_modules
npm install --legacy-peer-deps

# Manual build
npm run build:frontend
npm run build:backend
```

### If PM2 fails to start:
```bash
# Check if dist folder exists
ls -la dist/

# Check the built file
ls -la dist/index.js

# Start manually for debugging
node dist/index.js
```

## Updated Scripts in package.json:
- `build:frontend`: Builds the React frontend
- `build:backend`: Builds the Node.js backend
- `build`: Runs both frontend and backend builds

The deployment package is now properly configured for WSA hosting with AWS Parameter Store integration.