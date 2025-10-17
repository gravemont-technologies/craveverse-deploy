#!/bin/bash

# CraveVerse Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up CraveVerse..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Check environment file
setup_env() {
  if [ -f ".env" ]; then
    print_success ".env file found with existing configuration"
    print_status "Please verify your environment variables are correct"
  else
    print_warning ".env file not found"
    print_status "Please create a .env file with your configuration"
  fi
}

# Check if required tools are installed
check_tools() {
    print_status "Checking required tools..."
    
    # Check for Git
    if ! command -v git &> /dev/null; then
        print_warning "Git is not installed. Please install Git from https://git-scm.com/"
    else
        print_success "Git is installed"
    fi
    
    # Check for VS Code (optional)
    if command -v code &> /dev/null; then
        print_success "VS Code is installed"
    else
        print_warning "VS Code is not installed. Consider installing it for better development experience"
    fi
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Setting up Git hooks..."
        
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for CraveVerse

echo "Running pre-commit checks..."

# Run linting
npm run lint

# Run type checking
npm run type-check

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks set up successfully"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p public/images
    mkdir -p public/icons
    mkdir -p src/components/ui
    mkdir -p src/lib
    mkdir -p src/hooks
    mkdir -p database
    mkdir -p scripts
    
    print_success "Directories created successfully"
}

# Run initial build
run_build() {
    print_status "Running initial build..."
    
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed. Please check the errors above"
        exit 1
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with your actual values:"
    echo "   - Supabase URL and keys"
    echo "   - Clerk publishable and secret keys"
    echo "   - PostHog key (optional)"
    echo ""
    echo "2. Set up your Supabase database:"
    echo "   - Create a new Supabase project"
    echo "   - Run the SQL schema from database/schema.sql"
    echo "   - Update your Supabase keys in .env.local"
    echo ""
    echo "3. Set up Clerk authentication:"
    echo "   - Create a new Clerk application"
    echo "   - Configure authentication providers"
    echo "   - Update your Clerk keys in .env.local"
    echo ""
    echo "4. Start the development server:"
    echo "   npm run dev"
    echo ""
    echo "5. Open http://localhost:3000 in your browser"
    echo ""
    echo "For more information, see the README.md file"
}

# Main setup function
main() {
    echo "🚀 CraveVerse Setup Script"
    echo "=========================="
    echo ""
    
    check_node
    check_npm
    check_tools
    create_directories
    install_dependencies
    setup_env
    setup_git_hooks
    run_build
    show_next_steps
}

# Run main function
main "$@"
