const { SSMClient, GetParameterCommand, GetParametersCommand } = require("@aws-sdk/client-ssm");

// Initialize AWS SSM client
const ssmClient = new SSMClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

// Parameter names in AWS Systems Manager
const PARAMETER_NAMES = {
  DATABASE_URL: '/jaberco/database-url',
  SESSION_SECRET: '/jaberco/session-secret',
  CLOUDINARY_CLOUD_NAME: '/jaberco/cloudinary-cloud-name',
  CLOUDINARY_API_KEY: '/jaberco/cloudinary-api-key',
  CLOUDINARY_API_SECRET: '/jaberco/cloudinary-api-secret',
  STRIPE_PUBLISHABLE_KEY: '/jaberco/stripe-publishable-key',
  STRIPE_SECRET_KEY: '/jaberco/stripe-secret-key',
  STRIPE_WEBHOOK_SECRET: '/jaberco/stripe-webhook-secret',
  TWILIO_ACCOUNT_SID: '/jaberco/twilio-account-sid',
  TWILIO_AUTH_TOKEN: '/jaberco/twilio-auth-token',
  TWILIO_PHONE_NUMBER: '/jaberco/twilio-phone-number',
  SENDGRID_API_KEY: '/jaberco/sendgrid-api-key'
};

/**
 * Retrieve a single parameter from AWS Systems Manager
 * @param {string} parameterName - The parameter name in SSM
 * @param {boolean} withDecryption - Whether to decrypt the parameter
 * @returns {Promise<string>} The parameter value
 */
async function getParameter(parameterName, withDecryption = true) {
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption
    });
    
    const response = await ssmClient.send(command);
    return response.Parameter?.Value;
  } catch (error) {
    console.error(`Error retrieving parameter ${parameterName}:`, error.message);
    throw error;
  }
}

/**
 * Retrieve multiple parameters from AWS Systems Manager
 * @param {string[]} parameterNames - Array of parameter names
 * @param {boolean} withDecryption - Whether to decrypt the parameters
 * @returns {Promise<Object>} Object with parameter names as keys and values
 */
async function getParameters(parameterNames, withDecryption = true) {
  try {
    const command = new GetParametersCommand({
      Names: parameterNames,
      WithDecryption: withDecryption
    });
    
    const response = await ssmClient.send(command);
    const parameters = {};
    
    response.Parameters?.forEach(param => {
      const envVarName = Object.keys(PARAMETER_NAMES).find(
        key => PARAMETER_NAMES[key] === param.Name
      );
      if (envVarName) {
        parameters[envVarName] = param.Value;
      }
    });
    
    return parameters;
  } catch (error) {
    console.error('Error retrieving parameters:', error.message);
    throw error;
  }
}

/**
 * Load all Jaberco application secrets from AWS Systems Manager
 * and set them as environment variables
 */
async function loadSecretsFromAWS() {
  try {
    console.log('Loading secrets from AWS Systems Manager...');
    
    const parameterNames = Object.values(PARAMETER_NAMES);
    const secrets = await getParameters(parameterNames);
    
    // Set environment variables
    Object.entries(secrets).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    console.log(`Loaded ${Object.keys(secrets).length} secrets from AWS SSM`);
    return secrets;
  } catch (error) {
    console.error('Failed to load secrets from AWS:', error.message);
    throw error;
  }
}

// Export functions for CommonJS
module.exports = {
  getParameter,
  getParameters,
  loadSecretsFromAWS,
  PARAMETER_NAMES
};