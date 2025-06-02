
const fs = require('fs');
const path = require('path');

function setupMigrationEnv() {
  console.log('Setting up migration environment...');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Add migration environment variables if they don't exist
  const migrationVars = [
    '# Migration Configuration',
    '# Set OLD_DATABASE_URL to your old database connection string',
    '# OLD_DATABASE_URL=postgresql://username:password@host:port/old_database_name'
  ];
  
  let needsUpdate = false;
  
  if (!envContent.includes('OLD_DATABASE_URL')) {
    envContent += '\n' + migrationVars.join('\n') + '\n';
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    fs.writeFileSync(envPath, envContent);
    console.log('Updated .env file with migration variables');
  }
  
  console.log('\n=== Migration Setup Instructions ===');
  console.log('1. Set your OLD_DATABASE_URL in the .env file');
  console.log('2. Make sure your current DATABASE_URL points to the new database');
  console.log('3. Run: node migrate-data.js');
  console.log('=====================================\n');
}

setupMigrationEnv();
