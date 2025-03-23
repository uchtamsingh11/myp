const fs = require('fs');
const path = require('path');

// Check if .env.local exists and create it if it doesn't
const envLocalPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('Creating .env.local file with placeholder values...');
  // You can add your own environment variables here
  const envContent = `# Placeholder environment variables
# Add your own values here
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other required environment variables below
`;
  fs.writeFileSync(envLocalPath, envContent);
}

console.log('Environment setup complete!');
