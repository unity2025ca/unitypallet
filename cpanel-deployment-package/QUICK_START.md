# Jaberco E-commerce Platform - Quick Start Guide

## WSA Hosting Deployment

### 1. Upload to GitHub
- Upload the `jaberco-github-ready` folder contents to your GitHub repository
- Ensure all files are committed and pushed

### 2. Clone on WSA Server
```bash
git clone [your-github-repo-url]
cd [repository-name]
```

### 3. Configure Secrets (Choose One Option)

#### Option A: AWS Parameter Store (Recommended)
```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Follow AWS_PARAMETER_STORE_SETUP.md to configure all secrets
```

#### Option B: Environment Variables
```bash
# Copy and edit environment file
cp .env.example .env
nano .env
# Fill in all required values
```

### 4. Deploy
```bash
# Make deployment script executable
chmod +x deploy-github.sh

# Run deployment
./deploy-github.sh
```

### 5. Verify
```bash
# Check application status
pm2 status

# View logs
pm2 logs jaberco-app

# Test application
curl http://localhost:5000
```

## Features Included
- Complete Arabic/English e-commerce platform
- Admin dashboard with publisher permissions
- Animated Jaberco logo loading screens
- Stripe payment integration
- SMS and email notifications
- Automated backup system
- AWS Parameter Store secrets management

## Support Files
- `AWS_PARAMETER_STORE_SETUP.md` - AWS secrets configuration
- `DEPLOYMENT_INSTRUCTIONS.md` - Detailed deployment guide
- `README.md` - Project overview
- `secrets.json` - Required secrets reference