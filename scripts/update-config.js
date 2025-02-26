// This script updates the config.js file with environment variables
// It can be run during the build process in GitHub Actions

const fs = require('fs');
const path = require('path');

// Path to the config file
const configPath = path.join(__dirname, '../public/config.js');

// Read environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
const authProvider = process.env.AUTH_PROVIDER || 'azure';
const version = process.env.APP_VERSION || '1.0.0';

// Create the config content
const configContent = `// This file is auto-generated during build
window.APP_CONFIG = {
  apiUrl: '${apiUrl}',
  authProvider: '${authProvider}',
  version: '${version}',
  buildTime: '${new Date().toISOString()}'
};`;

// Write the config file
fs.writeFileSync(configPath, configContent);

console.log(`Config file updated at ${configPath}`); 