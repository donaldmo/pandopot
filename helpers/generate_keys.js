const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secrets
const ACCESS_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
const REFRESH_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
const SESSION_SECRET = crypto.randomBytes(32).toString('hex');
const CONFIRM_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
const RESET_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');

// Log the generated secrets to the console
console.table({ 
  ACCESS_TOKEN_SECRET, 
  REFRESH_TOKEN_SECRET, 
  SESSION_SECRET, 
  CONFIRM_TOKEN_SECRET, 
  RESET_TOKEN_SECRET 
});

// Define the .env file content with empty placeholders for non-secret values
const envContent = `
DB_USERNAME_PRO=
DB_NAME_PROD=
DB_PASS_PROD=

ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

ACCESS_TOKEN_EXP="7d"   # 1 week in days
REFRESH_TOKEN_EXP=604800   # 1 week in seconds
CONFIRM_TOKEN_EXP=604800   # 1 week in seconds
CONFIRM_TOKEN_SECRET=${CONFIRM_TOKEN_SECRET}

RESET_TOKEN_SECRET=${RESET_TOKEN_SECRET}
RESET_TOKEN_EXP=604800  # Set reset token expiration to 1 week for consistency

SESSION_NAME=
SESSION_SECRET=${SESSION_SECRET}
SESSION_LIFETIME=31536000000   # 1 year in milliseconds

EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=

APP_NAME=pandopot
API_ENDPOINT=http://localhost:4000  # Fixed typo in API endpoint
`;

// Write the .env file to the project root
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent.trim(), 'utf8');

console.log(`.env file created at ${envPath}`);
