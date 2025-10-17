#!/usr/bin/env node

/**
 * CraveVerse Setup Script
 * Cross-platform Node.js setup script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 18) {
    log.error(`Node.js version 18+ is required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  log.success(`Node.js ${nodeVersion} is installed`);
}

// Check npm version
function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`npm ${npmVersion} is installed`);
  } catch (error) {
    log.error('npm is not installed. Please install npm.');
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  log.info('Creating necessary directories...');
  
  const directories = [
    'public/images',
    'public/icons',
    'src/components/ui',
    'src/lib',
    'src/hooks',
    'database',
    'scripts'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  log.success('Directories created successfully');
}

// Install dependencies
function installDependencies() {
  log.info('Installing dependencies...');
  
  try {
    if (fs.existsSync('package-lock.json')) {
      execSync('npm ci', { stdio: 'inherit' });
    } else {
      execSync('npm install', { stdio: 'inherit' });
    }
    log.success('Dependencies installed successfully');
  } catch (error) {
    log.error('Failed to install dependencies');
    process.exit(1);
  }
}

// Check environment file
function setupEnvironment() {
  if (fs.existsSync('.env')) {
    log.success('.env file found with existing configuration');
    log.info('Please verify your environment variables are correct');
  } else {
    log.warning('.env file not found');
    log.info('Please create a .env file with your configuration');
    log.info('Required variables: SUPABASE_URL, SUPABASE_ANON_KEY, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY');
  }
}

// Run initial build
function runBuild() {
  log.info('Running initial build...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log.success('Build completed successfully');
  } catch (error) {
    log.error('Build failed. Please check the errors above');
    process.exit(1);
  }
}

// Display next steps
function showNextSteps() {
  console.log('');
  console.log(`${colors.green}🎉 Setup completed successfully!${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Update .env.local with your actual values:');
  console.log('   - Supabase URL and keys');
  console.log('   - Clerk publishable and secret keys');
  console.log('   - PostHog key (optional)');
  console.log('');
  console.log('2. Set up your Supabase database:');
  console.log('   - Create a new Supabase project');
  console.log('   - Run the SQL schema from database/schema.sql');
  console.log('   - Update your Supabase keys in .env.local');
  console.log('');
  console.log('3. Set up Clerk authentication:');
  console.log('   - Create a new Clerk application');
  console.log('   - Configure authentication providers');
  console.log('   - Update your Clerk keys in .env.local');
  console.log('');
  console.log('4. Start the development server:');
  console.log('   npm run dev');
  console.log('');
  console.log('5. Open http://localhost:3000 in your browser');
  console.log('');
  console.log('For more information, see the README.md file');
}

// Main setup function
function main() {
  console.log(`${colors.cyan}🚀 CraveVerse Setup Script${colors.reset}`);
  console.log('==========================');
  console.log('');
  
  checkNodeVersion();
  checkNpmVersion();
  createDirectories();
  installDependencies();
  setupEnvironment();
  runBuild();
  showNextSteps();
}

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { main };
