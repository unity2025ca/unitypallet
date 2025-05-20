const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create deployment folder if it doesn't exist
const deploymentDir = path.join(__dirname, 'deployment');
if (!fs.existsSync(deploymentDir)) {
  fs.mkdirSync(deploymentDir);
  console.log('Created deployment directory');
}

// Copy required files to deployment folder
const requiredFiles = [
  'package.json',
  'package-lock.json',
  '.htaccess',
  'ecosystem.config.js',
  'server-check.js',
  'CPANEL_DEPLOYMENT_STEPS.md',
  'drizzle.config.ts'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(deploymentDir, file)
    );
    console.log(`Copied ${file} to deployment directory`);
  } else {
    console.log(`Warning: ${file} does not exist`);
  }
});

// Copy directories
const requiredDirs = [
  'server',
  'shared',
  'drizzle'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    // Create destination directory if it doesn't exist
    const destDir = path.join(deploymentDir, dir);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy directory content recursively
    copyDirRecursive(path.join(__dirname, dir), destDir);
    console.log(`Copied ${dir} directory to deployment directory`);
  } else {
    console.log(`Warning: ${dir} directory does not exist`);
  }
});

// Function to copy directory recursively
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
      continue; // Skip node_modules and hidden directories
    }
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Deployment files have been prepared in the deployment directory');
console.log('Next steps:');
console.log('1. Build the frontend (npm run build)');
console.log('2. Copy the dist directory to the deployment directory');
console.log('3. Create a ZIP file of the deployment directory');
console.log('4. Upload the ZIP file to your cPanel host');
console.log('5. Follow the instructions in CPANEL_DEPLOYMENT_STEPS.md');