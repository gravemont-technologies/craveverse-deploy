# CraveVerse Setup Guide

This guide will walk you through setting up the CraveVerse development environment step by step.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**For Windows:**
```bash
# Run the setup script
scripts\setup.bat
```

**For macOS/Linux:**
```bash
# Run the setup script
./scripts/setup.sh
```

**For PowerShell:**
```powershell
# Run the PowerShell setup script
.\scripts\setup.ps1
```

### Option 2: Manual Setup

Follow the steps below if you prefer to set up manually.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **VS Code** (recommended) - [Download from code.visualstudio.com](https://code.visualstudio.com/)

## 🛠️ Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd craveverse

# Install dependencies
npm install
```

### Step 2: Set Up Environment Variables

1. The project already includes a `.env` file with your existing configuration.

2. Verify and update the following values in your `.env` file:

   ```env
   # Supabase Configuration (already configured)
   SUPABASE_URL=https://jnwfeglrzmnetjwbxeub.supabase.co
   SUPABASE_ANON_KEY=your-existing-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Clerk Authentication (already configured)
   CLERK_PUBLISHABLE_KEY=pk_test_cXVhbGl0eS1tYW4tOTEuY2xlcmsuYWNjb3VudHMuZGV2JA
   CLERK_SECRET_KEY=your-clerk-secret-key

   # PostHog Analytics (already configured)
   POSTHOG_KEY=phc_U3jVBHenqMq2jz5EBkrT28wwmt9dxqKj1WUqV8pWK4T
   POSTHOG_HOST=https://us.i.posthog.com
   ```

### Step 3: Set Up Supabase Database

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Choose your organization
   - Enter project name: "CraveVerse"
   - Set a strong database password
   - Choose a region close to your users
   - Click "Create new project"

2. **Run the Database Schema:**
   - Go to your Supabase project dashboard
   - Navigate to "SQL Editor" in the left sidebar
   - Click "New query"
   - Copy the contents of `database/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

3. **Get Your Supabase Keys:**
   - Go to "Settings" → "API" in your Supabase dashboard
   - Copy the "Project URL" and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the "service_role" key and paste it as `SUPABASE_SERVICE_ROLE_KEY`

4. **Set Up Storage:**
   - Go to "Storage" in your Supabase dashboard
   - The `files` bucket should be created automatically by the schema
   - If not, create a new bucket named "files" and set it to private

### Step 4: Set Up Clerk Authentication

1. **Create a Clerk Application:**
   - Go to [clerk.com](https://clerk.com)
   - Sign up or log in
   - Click "Add application"
   - Enter application name: "CraveVerse"
   - Choose "Next.js" as the framework
   - Click "Create application"

2. **Configure Authentication:**
   - In your Clerk dashboard, go to "User & Authentication"
   - Configure your preferred authentication methods:
     - Email/Password
     - Google OAuth
     - GitHub OAuth
     - etc.

3. **Get Your Clerk Keys:**
   - Go to "API Keys" in your Clerk dashboard
   - Copy the "Publishable key" and paste it as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Copy the "Secret key" and paste it as `CLERK_SECRET_KEY`

4. **Configure Redirect URLs:**
   - In your Clerk dashboard, go to "Paths"
   - Set the following paths:
     - Sign-in path: `/sign-in`
     - Sign-up path: `/sign-up`
     - After sign-in path: `/dashboard`
     - After sign-up path: `/dashboard`

### Step 5: Set Up PostHog Analytics (Optional)

1. **Create a PostHog Project:**
   - Go to [posthog.com](https://posthog.com)
   - Sign up or log in
   - Click "New project"
   - Enter project name: "CraveVerse"
   - Choose your organization
   - Click "Create project"

2. **Get Your PostHog Key:**
   - In your PostHog dashboard, go to "Project Settings"
   - Copy the "Project API Key" and paste it as `NEXT_PUBLIC_POSTHOG_KEY`
   - Set `NEXT_PUBLIC_POSTHOG_HOST` to `https://app.posthog.com`

### Step 6: Run the Development Server

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Supabase connection issues:**
   - Verify your Supabase URL and keys are correct
   - Check that your Supabase project is active
   - Ensure the database schema has been applied

3. **Clerk authentication issues:**
   - Verify your Clerk keys are correct
   - Check that your redirect URLs are configured properly
   - Ensure your domain is added to Clerk's allowed origins

4. **Build errors:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review the [database/schema.sql](database/schema.sql) for database structure
- Check the console for error messages
- Verify all environment variables are set correctly

## 📁 Project Structure

```
craveverse/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                # Utility libraries
│   └── hooks/              # Custom React hooks
├── database/
│   └── schema.sql          # Database schema
├── scripts/
│   ├── setup.sh            # Unix setup script
│   ├── setup.bat           # Windows setup script
│   └── setup.ps1           # PowerShell setup script
├── public/                 # Static assets
├── .env.local             # Environment variables
└── README.md              # Project documentation
```

## 🚀 Next Steps

Once your development environment is set up:

1. **Explore the codebase** - Start with the landing page and navigation
2. **Test the authentication flow** - Sign up and sign in
3. **Upload a test file** - Try the workspace functionality
4. **View the dashboard** - Check out the metrics and insights
5. **Customize the design** - Modify colors, fonts, and layouts
6. **Add new features** - Extend the functionality as needed

## 🔒 Security Notes

- Never commit your `.env.local` file
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Keep your dependencies updated
- Review the security policies in the database schema

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [PostHog Documentation](https://posthog.com/docs)

---

Happy coding! 🎉
