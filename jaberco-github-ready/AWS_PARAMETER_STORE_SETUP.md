# AWS Systems Manager Parameter Store Setup for Jaberco E-commerce Platform

## Overview
This guide explains how to configure AWS Systems Manager Parameter Store to securely manage your Jaberco application secrets for WSA hosting deployment.

## Prerequisites
- AWS CLI installed and configured
- AWS account with appropriate permissions for Systems Manager Parameter Store
- WSA hosting environment with AWS credentials configured

## Parameter Store Configuration

### 1. Set AWS Region
```bash
export AWS_REGION=us-east-1  # or your preferred region
```

### 2. Create SecureString Parameters
Run these commands to create all required parameters in AWS Parameter Store:

```bash
# Database Configuration
aws ssm put-parameter --name "/jaberco/database/url" --value "your_postgresql_connection_string" --type "SecureString"

# Stripe Payment Configuration
aws ssm put-parameter --name "/jaberco/stripe/secret-key" --value "sk_live_your_stripe_secret_key" --type "SecureString"
aws ssm put-parameter --name "/jaberco/stripe/webhook-secret" --value "whsec_your_webhook_secret" --type "SecureString"

# Cloudinary Image Management
aws ssm put-parameter --name "/jaberco/cloudinary/cloud-name" --value "your_cloud_name" --type "SecureString"
aws ssm put-parameter --name "/jaberco/cloudinary/api-key" --value "your_api_key" --type "SecureString"
aws ssm put-parameter --name "/jaberco/cloudinary/api-secret" --value "your_api_secret" --type "SecureString"

# Twilio SMS Configuration
aws ssm put-parameter --name "/jaberco/twilio/account-sid" --value "your_account_sid" --type "SecureString"
aws ssm put-parameter --name "/jaberco/twilio/auth-token" --value "your_auth_token" --type "SecureString"
aws ssm put-parameter --name "/jaberco/twilio/phone-number" --value "your_twilio_phone" --type "SecureString"

# SendGrid Email Configuration
aws ssm put-parameter --name "/jaberco/sendgrid/api-key" --value "SG.your_sendgrid_api_key" --type "SecureString"

# Session and Security
aws ssm put-parameter --name "/jaberco/session/secret" --value "your_secure_session_secret_min_32_chars" --type "SecureString"

# Application Configuration
aws ssm put-parameter --name "/jaberco/backup/database-url" --value "your_backup_db_connection_string" --type "SecureString"
```

### 3. Verify Parameters
```bash
# List all Jaberco parameters
aws ssm get-parameters-by-path --path "/jaberco" --recursive --with-decryption

# Test specific parameter
aws ssm get-parameter --name "/jaberco/database/url" --with-decryption
```

## WSA Environment Configuration

### 1. Configure AWS Credentials
In your WSA hosting environment, set these environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 2. Alternative: Use AWS IAM Role
For enhanced security, attach an IAM role to your WSA instance with this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            "Resource": "arn:aws:ssm:*:*:parameter/jaberco/*"
        }
    ]
}
```

## Deployment Process

### 1. Clone Repository
```bash
git clone your_github_repository_url
cd jaberco-github-deployment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Application
```bash
npm run build
```

### 4. Start with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Security Best Practices

1. **Least Privilege**: Grant minimal required permissions
2. **Parameter Encryption**: All sensitive data uses SecureString type
3. **Access Logging**: Enable CloudTrail for parameter access auditing
4. **Rotation**: Regularly rotate API keys and secrets
5. **Environment Separation**: Use different parameter paths for staging/production

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Verify IAM permissions
   aws sts get-caller-identity
   aws ssm describe-parameters --filters "Key=Name,Values=/jaberco"
   ```

2. **Parameter Not Found**
   ```bash
   # Check parameter exists
   aws ssm get-parameter --name "/jaberco/database/url"
   ```

3. **Application Startup Errors**
   ```bash
   # Check PM2 logs
   pm2 logs
   
   # Check application logs
   tail -f logs/app.log
   ```

## Manual Fallback
If AWS Parameter Store is unavailable, the application will fall back to environment variables. Create a `.env` file with all required variables as documented in `.env.example`.

## Support
For issues with AWS Parameter Store setup, contact AWS Support or refer to the AWS Systems Manager documentation.