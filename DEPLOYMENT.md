# Deployment Guide

## Quick Start

1. **Set up MongoDB**
   - Create a MongoDB database (local or MongoDB Atlas)
   - Get your connection string

2. **Get YouTube API Key** (Optional)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Get your YouTube Channel ID

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values

4. **Install and Run**
   ```bash
   npm install
   npm run dev
   ```

## Deploying to Render

### Step 1: Prepare Your Repository
- Push your code to GitHub
- Ensure all environment variables are documented in `.env.example`

### Step 2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and branch

### Step 3: Configure Build Settings
- **Name**: wisdom-circle-malahida (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: main (or your default branch)
- **Root Directory**: (leave empty if root)
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 4: Set Environment Variables
Add all variables from your `.env` file:
- `MONGODB_URI`
- `JWT_SECRET` (generate a strong random string)
- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_ID`
- `ADMIN_PASSWORD` (choose a strong password)
- `NEXT_PUBLIC_SITE_URL` (your Render URL, e.g., `https://wisdom-circle-malahida.onrender.com`)

### Step 5: Deploy
- Click "Create Web Service"
- Wait for build to complete
- Your site will be live at the provided URL

## Post-Deployment Checklist

- [ ] Test admin login at `/hwaya`
- [ ] Verify MongoDB connection
- [ ] Test article submission
- [ ] Verify YouTube videos load (if API key configured)
- [ ] Check SEO meta tags
- [ ] Test dark mode toggle
- [ ] Verify all pages load correctly
- [ ] Test responsive design on mobile

## MongoDB Atlas Setup (Cloud Database)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your Render region
   - Create cluster

3. **Configure Database Access**
   - Go to "Database Access"
   - Create database user
   - Set username and password
   - Save credentials

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (for Render)
   - Or add Render's IP ranges

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `wisdom-circle` (or your preferred name)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB network access settings
- Ensure database user has proper permissions

### Admin Login Not Working
- Verify `ADMIN_PASSWORD` is set correctly
- Check JWT_SECRET is set
- Clear cookies and try again

### YouTube Videos Not Loading
- Verify `YOUTUBE_API_KEY` is valid
- Check `YOUTUBE_CHANNEL_ID` is correct
- Ensure YouTube Data API v3 is enabled
- Check API quota limits

### Environment Variables Not Working
- Restart Render service after adding variables
- Verify variable names match exactly
- Check for typos in values

## Security Recommendations

1. **Use Strong Passwords**
   - Admin password should be at least 16 characters
   - Use a password manager

2. **Secure JWT Secret**
   - Generate random string: `openssl rand -base64 32`
   - Never commit to git

3. **MongoDB Security**
   - Use strong database passwords
   - Restrict network access when possible
   - Enable MongoDB Atlas encryption

4. **HTTPS Only**
   - Render provides HTTPS by default
   - Ensure `NEXT_PUBLIC_SITE_URL` uses `https://`

5. **Rate Limiting** (Future Enhancement)
   - Consider adding rate limiting to API endpoints
   - Protect admin login from brute force

## Monitoring

- Check Render logs regularly
- Monitor MongoDB Atlas metrics
- Set up error tracking (e.g., Sentry)
- Monitor YouTube API quota usage

