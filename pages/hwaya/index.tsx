import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';

interface Article {
  _id: string;
  title: string;
  author: string;
  approved: boolean;
  views: number;
  createdAt: string;
}

interface Stats {
  totalArticles: number;
  approvedArticles: number;
  pendingArticles: number;
  totalViews: number;
}

interface Settings {
  footerText: string;
  aboutText: string;
  communityDescription: string;
  socialLinks: {
    discord?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  podcastHighlights: string[];
}

interface Talk {
  id: string;
  title: string;
  text: string;
  nickname: string;
  category: string;
  visibility: 'public' | 'private';
  date: string;
  likes: number;
  comments: { id: string; nickname: string; text: string; date: string }[];
  status: 'pending' | 'approved' | 'responded' | 'deleted';
  slug?: string;
  email?: string;
}

interface AdminProfile {
  user_id: string;
  username: string;
  display_name?: string;
  age?: number;
  gender?: string;
  city?: string;
  bio?: string;
  image_url?: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'settings' | 'announcements' | 'stats' | 'videos' | 'categories' | 'talks' | 'profiles'>('stats');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [talks, setTalks] = useState<Talk[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) {
        setAuthenticated(true);
        loadData();
      }
    } catch {
      setAuthenticated(false);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, articlesRes, settingsRes, announcementsRes, videosRes, categoriesRes, talksRes, profilesRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/articles'),
        axios.get('/api/settings'),
        axios.get('/api/announcements'),
        axios.get('/api/videos'),
        axios.get('/api/categories'),
        axios.get('/api/talks/admin'),
        axios.get('/api/admin/profiles'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (articlesRes.data.success) setArticles(articlesRes.data.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.data);
      if (announcementsRes.data.success) setAnnouncements(announcementsRes.data.data);
      if (videosRes.data.success) setVideos(videosRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      if (talksRes.data.success) setTalks(talksRes.data.data);
      if (profilesRes.data.success) setProfiles(profilesRes.data.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/admin/login', { password });
      if (res.data.success) {
        setAuthenticated(true);
        loadData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const updateTalkStatus = async (id: string, action: 'approve' | 'responded' | 'delete') => {
    try {
      const res = await axios.put('/api/talks/admin', { id, action });
      if (res.data.success) {
        setTalks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status:
                    action === 'approve'
                      ? 'approved'
                      : action === 'responded'
                      ? 'responded'
                      : 'deleted',
                }
              : t
          )
        );
      }
    } catch (e) {
      console.error('Failed to update talk status', e);
    }
  };

  const deleteTalkComment = async (talkId: string, commentId: string) => {
    try {
      const res = await axios.delete(`/api/talks/${talkId}/comments/${commentId}`);
      if (res.data?.success) {
        const updated = res.data.data as Talk;
        setTalks((prev) => prev.map((t) => (t.id === talkId ? updated : t)));
      }
    } catch (e) {
      console.error('Failed to delete comment', e);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/logout');
      setAuthenticated(false);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const approveArticle = async (id: string) => {
    try {
      await axios.put(`/api/admin/articles/${id}/approve`, { approved: true });
      loadData();
    } catch (err) {
      alert('Failed to approve article');
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await axios.delete(`/api/admin/articles/${id}/delete`);
      loadData();
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      await axios.put('/api/settings', updates);
      alert('Settings updated successfully');
      loadData();
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  const createAnnouncement = async (title: string, message: string) => {
    try {
      await axios.post('/api/announcements', { title, message });
      alert('Announcement created successfully');
      loadData();
    } catch (err) {
      alert('Failed to create announcement');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`/api/announcements/${id}/delete`);
      alert('Announcement deleted successfully');
      loadData();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  const createVideo = async (title: string, youtubeUrl: string, description: string, category: string) => {
    try {
      await axios.post('/api/videos', { title, youtubeUrl, description, category });
      alert('Video added successfully');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add video');
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`/api/videos/${id}/delete`);
      alert('Video deleted successfully');
      loadData();
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  const deleteProfile = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete the profile "${username}"?`)) return;
    try {
      await axios.delete('/api/admin/profiles', { data: { user_id: userId } });
      setProfiles((prev) => prev.filter((p) => p.user_id !== userId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete profile');
    }
  };

  const createCategory = async (name: string, icon: string, color: string, order: number, active: boolean) => {
    try {
      await axios.post('/api/categories', { name, icon, color, order, active });
      alert('Category created successfully');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create category');
    }
  };

  const updateCategory = async (id: string, updates: any) => {
    try {
      await axios.put(`/api/categories/${id}/update`, updates);
      alert('Category updated successfully');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Videos in this category will need to be moved first.')) return;
    try {
      await axios.delete(`/api/categories/${id}/delete`);
      alert('Category deleted successfully');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  if (!authenticated) {
    return (
      <Layout title="Admin Login">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Admin Login
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {(['stats', 'articles', 'settings', 'announcements', 'videos', 'categories', 'talks', 'profiles'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Articles</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalArticles}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.approvedArticles}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pendingArticles}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.totalViews}</p>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By {article.author} • {article.views} views • {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      article.approved
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}
                  >
                    {article.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {!article.approved && (
                    <button
                      onClick={() => approveArticle(article._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteArticle(article._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Text
              </label>
              <textarea
                defaultValue={settings.footerText}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onBlur={(e) => updateSettings({ footerText: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Text
              </label>
              <textarea
                defaultValue={settings.aboutText}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onBlur={(e) => updateSettings({ aboutText: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Community Description
              </label>
              <textarea
                defaultValue={settings.communityDescription}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onBlur={(e) => updateSettings({ communityDescription: e.target.value })}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                {(['discord', 'youtube', 'instagram', 'twitter', 'facebook', 'tiktok'] as const).map((platform) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                      {platform}
                    </label>
                    <input
                      type="url"
                      defaultValue={settings.socialLinks[platform] || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onBlur={(e) =>
                        updateSettings({
                          socialLinks: { ...settings.socialLinks, [platform]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create New Announcement
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.querySelector('[name="title"]') as HTMLInputElement).value;
                  const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement).value;
                  createAnnouncement(title, message);
                  form.reset();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Create Announcement
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Existing Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No announcements yet.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{announcement.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Created: {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAnnouncement(announcement._id)}
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Video
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.querySelector('[name="title"]') as HTMLInputElement).value;
                  const youtubeUrl = (form.querySelector('[name="youtubeUrl"]') as HTMLInputElement).value;
                  const description = (form.querySelector('[name="description"]') as HTMLTextAreaElement).value;
                  const category = (form.querySelector('[name="category"]') as HTMLSelectElement).value;
                  createVideo(title, youtubeUrl, description, category);
                  form.reset();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Video Title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL *
                  </label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.active).sort((a, b) => a.order - b.order).map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    placeholder="Video description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add Video
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Videos</h3>
              {videos.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No videos yet.</p>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 text-xs rounded bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 capitalize">
                            {video.category}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 dark:text-white">{video.title}</h4>
                        {video.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{video.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Added: {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteVideo(video._id)}
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add New Category
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.querySelector('[name="name"]') as HTMLInputElement).value;
                  const icon = (form.querySelector('[name="icon"]') as HTMLInputElement).value;
                  const color = (form.querySelector('[name="color"]') as HTMLSelectElement).value;
                  const order = parseInt((form.querySelector('[name="order"]') as HTMLInputElement).value) || 0;
                  const active = (form.querySelector('[name="active"]') as HTMLInputElement).checked;
                  createCategory(name, icon, color, order, active);
                  form.reset();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Category Name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon (Emoji) *
                    </label>
                    <input
                      type="text"
                      name="icon"
                      placeholder="😄"
                      required
                      maxLength={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Gradient *
                    </label>
                    <select
                      name="color"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Color</option>
                      <option value="from-yellow-400 to-orange-500">Yellow to Orange</option>
                      <option value="from-purple-400 to-pink-500">Purple to Pink</option>
                      <option value="from-blue-400 to-cyan-500">Blue to Cyan</option>
                      <option value="from-green-400 to-emerald-500">Green to Emerald</option>
                      <option value="from-amber-400 to-yellow-500">Amber to Yellow</option>
                      <option value="from-red-400 to-pink-500">Red to Pink</option>
                      <option value="from-indigo-400 to-purple-500">Indigo to Purple</option>
                      <option value="from-teal-400 to-cyan-500">Teal to Cyan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    defaultChecked
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active (Show in sidebar)
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Add Category
                </button>
              </form>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Categories</h3>
              {categories.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No categories yet.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex justify-between items-start border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{category.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Slug: {category.slug}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            category.active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {category.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Order: {category.order}</span>
                          <span>Color: <span className="font-mono text-xs">{category.color}</span></span>
                        </div>
                        <div className="mt-3">
                          <div className={`w-32 h-8 rounded-lg bg-gradient-to-r ${category.color}`}></div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            const newActive = !category.active;
                            updateCategory(category._id, { active: newActive });
                          }}
                          className={`px-4 py-2 rounded-md text-sm transition-colors ${
                            category.active
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {category.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Profiles</h3>
              {profiles.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No profiles found.</p>
              ) : (
                <div className="space-y-4">
                  {profiles.map((p) => (
                    <div
                      key={p.user_id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex justify-between items-start border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={p.image_url || 'https://i.postimg.cc/0jYVJmWj/user.png'}
                            alt={p.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{p.display_name || p.username}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{p.city || 'Unknown'}{p.age ? ` • ${p.age}` : ''}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            (p.gender || '').toLowerCase() === 'female'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                              : (p.gender || '').toLowerCase() === 'male'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {p.gender || 'other'}
                          </span>
                        </div>
                        {p.bio && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{p.bio}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteProfile(p.user_id, p.username)}
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Talks Tab */}
        {activeTab === 'talks' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">إدارة مشاركات "أحاديث الحكمة"</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">اعتمد، علّم كمردود عليه، أو احذف المشاركات العامة والخاصة.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">جميع المشاركات</h3>
              {talks.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">لا توجد مشاركات حتى الآن.</p>
              ) : (
                <div className="space-y-4">
                  {talks.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow flex justify-between items-start border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                              {t.visibility === 'public' ? t.title : 'مشاركة خاصة'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              الفئة: {t.category} • النوع: {t.visibility === 'public' ? 'عام' : 'خاص'}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs rounded-full ${
                              t.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : t.status === 'responded'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : t.status === 'deleted'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {t.status === 'approved'
                              ? 'موافق عليها'
                              : t.status === 'responded'
                              ? 'تم الرد'
                              : t.status === 'deleted'
                              ? 'محذوفة'
                              : 'قيد المراجعة'}
                          </span>
                        </div>
                        {/* النص الكامل للمشاركة */}
                        <div className="mt-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص المشكلة</h5>
                          <p
                            dir="rtl"
                            className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line"
                          >
                            {t.text}
                          </p>
                          {t.nickname && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">المرسل: {t.nickname}</p>
                          )}
                          {t.visibility === 'private' && t.email && (
                            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">📧 بريد للتواصل: {t.email}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            التاريخ: {new Date(t.date).toLocaleString('ar-MA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {t.visibility === 'public' && t.slug && (
                            <a
                              href={`/talks/${t.slug}`}
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              فتح الصفحة
                            </a>
                          )}
                        </div>
                        {/* التعليقات */}
                        <div className="mt-4" dir="rtl">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التعليقات</h5>
                          {(!t.comments || t.comments.length === 0) ? (
                            <p className="text-gray-600 dark:text-gray-400">لا توجد تعليقات بعد.</p>
                          ) : (
                            <ul className="space-y-3">
                              {t.comments.map((c) => (
                                <li key={c.id} className="rounded-lg p-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                      <span className="ml-2">👤 {c.nickname}</span>
                                      <span>📅 {new Date(c.date).toLocaleString('ar-MA')}</span>
                                    </div>
                                    <button
                                      onClick={() => deleteTalkComment(t.id, c.id)}
                                      className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs"
                                    >
                                      حذف التعليق
                                    </button>
                                  </div>
                                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{c.text}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateTalkStatus(t.id, 'approve')}
                          disabled={t.status === 'approved' || t.status === 'responded'}
                          className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white"
                        >
                          اعتماد
                        </button>
                        <button
                          onClick={() => updateTalkStatus(t.id, 'responded')}
                          disabled={t.status === 'responded'}
                          className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
                        >
                          تمييز كمردود عليه
                        </button>
                        <button
                          onClick={() => updateTalkStatus(t.id, 'delete')}
                          className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

