# Supabase Integration Setup Guide

This guide will help you set up Supabase for the Korean Learning Application.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Basic understanding of database concepts

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Project Name**: `korean-learning-app`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project setup (2-3 minutes)

## Step 2: Get Project Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** API key

## Step 3: Configure Application

1. Open `supabase-config.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = "YOUR_PROJECT_URL_HERE";
   const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";
   ```

## Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify all tables were created successfully

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000` (or your domain)
3. Under **Redirect URLs**, add: `http://localhost:3000/main-menu.html`
4. Enable **Google** provider under **Authentication** → **Providers**:
   - Toggle Google to "Enabled"
   - Add your Google OAuth credentials (optional)

## Step 6: Test the Integration

1. Open `index.html` in your browser
2. Try signing up with a new account
3. Verify you can sign in and out
4. Check that user data appears in the Supabase dashboard

## Database Tables Overview

- **user_profiles**: User information and statistics
- **flashcards**: Korean vocabulary cards
- **user_progress**: Individual card progress per user
- **study_sessions**: Study session tracking
- **user_achievements**: User achievements and milestones

## Features Enabled

- ✅ User authentication (email/password + Google OAuth)
- ✅ User profile management
- ✅ Flashcard progress tracking
- ✅ Study session analytics
- ✅ Real-time data synchronization
- ✅ Row-level security for data protection

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**

   - Check that your Supabase URL and keys are correct
   - Ensure the user is properly authenticated

2. **"Permission denied" errors**

   - Verify RLS policies are correctly set up
   - Check that users are authenticated before making requests

3. **Google OAuth not working**

   - Ensure redirect URLs match exactly
   - Check that Google provider is enabled

4. **Data not saving**
   - Check browser console for errors
   - Verify database schema matches the SQL file

### Debug Mode

To enable debug logging, add this to your browser console:

```javascript
window.supabase = supabase;
```

## Production Deployment

For production deployment:

1. Update site URL and redirect URLs in Supabase settings
2. Use environment variables for sensitive data
3. Enable additional security features as needed
4. Set up proper CORS configuration

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify Supabase project settings
3. Review the database schema in SQL Editor
4. Check network requests in browser dev tools

## Next Steps

After setup is complete:

1. Customize the flashcard data
2. Add more authentication providers
3. Implement additional learning features
4. Set up analytics and reporting
