# Supabase Configuration Guide

## Current Configuration

**Project URL:** `https://bialelscmftlquykreij.supabase.co`

**Error:** `ERR_NAME_NOT_RESOLVED` - This means the domain cannot be resolved.

## How to Fix

### Step 1: Verify Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Check if your project exists and is **active** (not paused)
3. If paused, click "Resume project"
4. If the project doesn't exist, you need to:
   - Create a new project, OR
   - Use an existing project

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Step 3: Update Your Code

#### Option A: Update Environment Variables (Recommended)

Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Then restart your development server.

#### Option B: Update Default Values in Code

If you prefer to hardcode (not recommended for production), update these files:

1. **`src/lib/supabase.ts`** - Update `DEFAULT_SUPABASE_URL` and `DEFAULT_SUPABASE_ANON_KEY`
2. **`public/js/supabase.js`** - Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Step 4: Test the Connection

1. Try accessing your Supabase URL directly in a browser
2. You should see a JSON response or API documentation
3. If you get "site can't be reached", the project is likely paused or deleted

## Troubleshooting

- **ERR_NAME_NOT_RESOLVED**: Project is paused, deleted, or URL is incorrect
- **403 Forbidden**: API key is incorrect
- **Network error**: Check your internet connection and firewall settings

## Need Help?

If your project was deleted or you need to create a new one:
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Follow the setup wizard
4. Copy the new credentials to your code


