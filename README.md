# CraveVerse - AI-Powered Relationship Intelligence

A modern, production-ready Next.js 14 application designed to help users build, maintain, and optimize meaningful relationships through AI-driven behavioral insights and actionable guidance.

## 🚀 Features

- **AI-Driven Insights**: Personalized recommendations based on communication patterns
- **Data Visualization**: Intuitive charts and progress tracking for relationship dynamics
- **Privacy-First Design**: End-to-end encryption and secure data handling
- **Modern UI/UX**: Responsive design with dark/light mode support
- **File Analysis**: Upload and analyze communication documents
- **Real-time Dashboard**: Track relationship metrics and insights
- **Results Viewer**: Side-by-side comparison of original vs. analyzed content

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Authentication**: Clerk (configured)
- **Database**: Supabase (configured)
- **Analytics**: PostHog (configured)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles and design tokens
│   ├── dashboard/         # Dashboard page
│   ├── workspace/         # File upload and management
│   └── results/[id]/      # Results viewer with dynamic routing
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, etc.)
│   ├── navbar.tsx        # Navigation component
│   ├── hero.tsx          # Landing page hero section
│   ├── upload-area.tsx   # File upload with drag-and-drop
│   ├── file-list.tsx     # File management interface
│   └── results-viewer.tsx # Analysis results display
├── lib/                  # Utility libraries
│   ├── analytics.ts      # PostHog analytics integration
│   ├── supabase-client.ts # Supabase database operations
│   ├── clerk.ts          # Clerk authentication
│   └── utils.ts          # Common utilities
└── hooks/               # Custom React hooks
    └── use-toast.ts     # Toast notification hook
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- PostHog account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd craveverse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # Clerk
   CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SECRET_KEY=your-clerk-secret-key
   
   # PostHog (optional)
   POSTHOG_KEY=your-posthog-key
   POSTHOG_HOST=https://app.posthog.com
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup below)
   - Update your environment variables

5. **Set up Clerk**
   - Create a new Clerk application
   - Configure authentication providers
   - Update your environment variables

6. **Set up PostHog (optional)**
   - Create a new PostHog project
   - Get your project key
   - Update your environment variables

7. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Supabase Tables

The application requires the following tables in your Supabase database:

```sql
-- Files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Relationships table
CREATE TABLE relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal', 'professional', 'social')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Insights table
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id UUID REFERENCES files(id),
  relationship_id UUID REFERENCES relationships(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  impact TEXT DEFAULT 'neutral' CHECK (impact IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);
```

### Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Users can view their own files" ON files FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own files" ON files FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own files" ON files FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own files" ON files FOR DELETE USING (auth.uid()::text = user_id);

-- Relationships policies
CREATE POLICY "Users can view their own relationships" ON relationships FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own relationships" ON relationships FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own relationships" ON relationships FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own relationships" ON relationships FOR DELETE USING (auth.uid()::text = user_id);

-- Insights policies
CREATE POLICY "Users can view their own insights" ON insights FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own insights" ON insights FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own insights" ON insights FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete their own insights" ON insights FOR DELETE USING (auth.uid()::text = user_id);
```

## 🔧 Configuration

### Clerk Authentication

1. Create a new Clerk application
2. Configure your authentication providers (Google, GitHub, etc.)
3. Set up your domain and redirect URLs
4. Copy your publishable key and secret key to environment variables

### Supabase Configuration

1. Create a new Supabase project
2. Set up the database schema (see Database Setup above)
3. Configure storage buckets
4. Set up Row Level Security policies
5. Copy your project URL and anon key to environment variables

### PostHog Analytics (Optional)

1. Create a new PostHog project
2. Get your project key
3. Configure your domain
4. Copy your project key to environment variables

## 📱 Pages & Features

### Landing Page (`/`)
- Hero section with compelling value proposition
- Feature highlights and benefits
- Trust indicators and social proof
- Call-to-action for sign-up

### Dashboard (`/dashboard`)
- Overview of user's relationship metrics
- Recent activity feed
- Quick actions and shortcuts
- AI insights and recommendations

### Workspace (`/workspace`)
- File upload with drag-and-drop support
- File management and status tracking
- Upload progress and error handling
- File type validation and processing

### Results Viewer (`/results/[id]`)
- Side-by-side comparison of original vs. analyzed content
- Detailed AI analysis and insights
- Action buttons (approve, request revision, download, share)
- Confidence scores and impact indicators

## 🎨 Design System

### Color Tokens
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (Google Fonts)
- Scale: 12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px
- Weights: 400, 500, 600, 700

### Spacing
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## 🔒 Security & Privacy

- **End-to-end encryption** for all user data
- **Row Level Security** (RLS) in Supabase
- **Secure authentication** with Clerk
- **Privacy-first design** with minimal data collection
- **GDPR compliance** ready

## 📊 Analytics & Monitoring

- **PostHog integration** for user behavior tracking
- **Custom event tracking** for key user actions
- **Performance monitoring** and error tracking
- **A/B testing** capabilities

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## 🔮 Roadmap

- [ ] Advanced AI analysis features
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

Built with ❤️ for better relationships
