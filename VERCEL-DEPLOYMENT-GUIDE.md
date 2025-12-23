# Vercel Deployment Guide for Desi Finder

This guide will walk you through deploying your Desi Finder application to Vercel.

## Prerequisites

- ✅ GitHub repository with your code
- ✅ Vercel account (free tier works)
- ✅ Environment variables ready (Supabase, Google Places API)

## Step-by-Step Deployment Instructions

### Method 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in with your GitHub account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`Desi-Finder`)
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (already set in vercel.json)
   - **Output Directory**: `dist` (already set in vercel.json)
   - **Install Command**: `npm install` (already set in vercel.json)

4. **Add Environment Variables**
   Click "Environment Variables" and add the following:
   
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   VITE_ADMIN_PASSWORD=your_admin_password_here
   ```
   
   **Important**: 
   - Replace the placeholder values with your actual keys
   - Add these for all environments (Production, Preview, Development)
   - Never commit these values to GitHub!

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Configuration

### 1. Update Supabase CORS Settings
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Add your Vercel domain to allowed origins:
     ```
     https://your-project-name.vercel.app
     https://*.vercel.app
     ```

### 2. Update Google Places API Restrictions (Optional but Recommended)
   - Go to Google Cloud Console
   - Navigate to APIs & Services → Credentials
   - Edit your API key
   - Add HTTP referrer restrictions:
     ```
     https://your-project-name.vercel.app/*
     https://*.vercel.app/*
     ```

### 3. Custom Domain (Optional)
   - In Vercel dashboard, go to your project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Environment Variables Reference

Make sure to set these in Vercel dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `VITE_GOOGLE_PLACES_API_KEY` | Google Places API key | Yes |
| `VITE_ADMIN_PASSWORD` | Admin password | Yes |

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `package.json` has correct build script
- Check that Node.js version is compatible (Vercel uses Node 18.x by default)

### Routing Issues (404 on refresh)
- The `vercel.json` file handles this with rewrites
- If issues persist, check that all routes redirect to `index.html`

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding new environment variables
- Check that variables are added to all environments (Production, Preview, Development)

### CORS Errors
- Update Supabase CORS settings to include your Vercel domain
- Check that API keys are correctly configured

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- ✅ Deploy on every push to `main` branch (production)
- ✅ Create preview deployments for pull requests
- ✅ Rebuild on every commit

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Project Issues: Check your GitHub repository

---

**Your app is now live! 🚀**

Visit your deployment URL to see Desi Finder in action.

