# Setup Instructions

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed ([Download](https://nodejs.org/))
- npm or yarn package manager
- MongoDB database (local or MongoDB Atlas)
- YouTube API key (optional, for video features)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- MongoDB/Mongoose
- TailwindCSS
- Axios
- Authentication libraries
- And more...

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/wisdom-circle
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wisdom-circle

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# YouTube API Configuration (optional)
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-youtube-channel-id

# Admin Password
ADMIN_PASSWORD=your-secure-admin-password

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Generate JWT Secret

You can generate a secure JWT secret using:

```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/wisdom-circle`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist IP address (use `0.0.0.0/0` for development)
5. Get connection string from "Connect" → "Connect your application"

### 5. Get YouTube API Key (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy the API key
6. Find your YouTube Channel ID:
   - Go to your YouTube channel
   - Check the URL: `youtube.com/channel/CHANNEL_ID`
   - Or use a [Channel ID finder tool](https://commentpicker.com/youtube-channel-id.php)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. First-Time Admin Setup

1. Navigate to `/hwaya` (admin panel)
2. Enter the password you set in `ADMIN_PASSWORD`
3. You'll be logged in and can start managing content

## Verify Installation

Check that everything works:

- [ ] Homepage loads at `http://localhost:3000`
- [ ] Can navigate to `/articles`
- [ ] Can submit an article at `/articles/new`
- [ ] Admin panel accessible at `/hwaya`
- [ ] Can log in with admin password
- [ ] Can approve articles in admin panel
- [ ] YouTube videos load (if API configured)

## Common Issues

### Port Already in Use
If port 3000 is busy:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

### MongoDB Connection Error
- Verify MongoDB is running (if local)
- Check `MONGODB_URI` is correct
- Ensure network access is configured (for Atlas)

### TypeScript Errors
- Run `npm install` to ensure all types are installed
- Restart your IDE/editor
- Check Node.js version: `node --version` (should be 18+)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## Next Steps

After setup:
1. Customize site content via admin panel
2. Add your social media links
3. Submit test articles
4. Configure for production (see DEPLOYMENT.md)

## Need Help?

- Check the [README.md](README.md) for feature documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review error messages in terminal/console

