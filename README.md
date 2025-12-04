# Wisdom Circle – Malahida

A full-stack, SEO-optimized website dedicated to philosophy, freethought, atheism, rationalism, and Amazigh intellectual culture. Developed by Apollo.

## 🚀 Features

- **Article Management**: Submit, approve, and manage articles with automatic view tracking
- **YouTube Integration**: Display latest videos from the Wisdom Circle YouTube channel
- **Admin Panel**: Full content management system accessible at `/hwaya`
- **SEO Optimized**: Meta tags, sitemap, and SEO-friendly URLs
- **Dark Mode**: User-friendly dark/light theme toggle
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Dynamic Content**: All site content editable through admin panel

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React + Node.js)
- **Database**: MongoDB with Mongoose
- **Styling**: TailwindCSS
- **API Requests**: Axios
- **Authentication**: JWT with secure cookies
- **Deployment**: Render (or any Node.js hosting)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database (local or cloud like MongoDB Atlas)
- YouTube API key (optional, for video features)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd testvoida
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/wisdom-circle
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   YOUTUBE_API_KEY=your-youtube-api-key
   YOUTUBE_CHANNEL_ID=your-youtube-channel-id
   ADMIN_PASSWORD=your-admin-password
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── components/          # Reusable React components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ArticleCard.tsx
│   └── YouTubeVideoCard.tsx
├── lib/                 # Utility libraries
│   ├── mongodb.ts       # MongoDB connection
│   └── auth.ts          # Authentication utilities
├── models/              # Mongoose models
│   ├── Article.ts
│   ├── Announcement.ts
│   ├── Settings.ts
│   └── User.ts
├── pages/               # Next.js pages and API routes
│   ├── api/             # API endpoints
│   ├── articles/        # Article pages
│   ├── hedra/           # HEDRA page
│   ├── hwaya/           # Admin panel
│   ├── index.tsx        # Homepage
│   ├── about.tsx
│   ├── contact.tsx
│   └── _app.tsx
├── styles/              # Global styles
│   └── globals.css
└── utils/               # Utility functions
    └── youtube.ts       # YouTube API integration
```

## 🔐 Admin Panel

Access the admin panel at `/hwaya` using the password set in `ADMIN_PASSWORD`.

**Admin Features:**
- Approve/delete articles
- Edit homepage announcements
- Edit footer text and community description
- Manage social media links
- View site statistics

## 📝 API Endpoints

### Public Endpoints
- `GET /api/articles` - Get all approved articles
- `GET /api/articles/[slug]` - Get article by slug
- `POST /api/articles` - Submit new article
- `GET /api/announcements` - Get active announcements
- `GET /api/settings` - Get site settings
- `GET /api/youtube/videos` - Get YouTube videos

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/stats` - Get site statistics
- `GET /api/admin/articles` - Get all articles (including pending)
- `PUT /api/articles/[id]/approve` - Approve article
- `DELETE /api/articles/[id]/delete` - Delete article
- `PUT /api/settings` - Update site settings
- `POST /api/announcements` - Create announcement

## 🎨 SEO Keywords

The site is optimized for:
- malahida
- Moroccan atheists
- Amazigh philosophy
- kofar
- atheism
- Moroccan rationalists
- freethinkers
- philosophy podcasts
- Wisdom Circle community

## 🚢 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard
7. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random secret
- `YOUTUBE_API_KEY` - Your YouTube API key
- `YOUTUBE_CHANNEL_ID` - Your YouTube channel ID
- `ADMIN_PASSWORD` - Your admin password (will be hashed)
- `NEXT_PUBLIC_SITE_URL` - Your production URL

## 📄 License

This project is developed by Apollo for Wisdom Circle – Malahida.

## 🤝 Contributing

This is a private project. For contributions or questions, please contact the administrators.

## 📞 Support

For support, visit the contact page or reach out through the community's social media channels.

---

**Developed by Apollo** | **Wisdom Circle – Malahida**

