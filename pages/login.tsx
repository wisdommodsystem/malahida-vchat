import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function LoginPage() {
  const router = useRouter();
  const next = typeof router.query.next === 'string' ? router.query.next : '/community';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data?.success) {
        router.replace(next || '/community');
      } else {
        setError(res.data?.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login" description="Sign in to Wisdom Community">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" required />
          </div>
          <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don&nbsp;\&apos;t have an account?
            <button type="button" onClick={() => router.push('/register')} className="ml-1 text-primary-600 dark:text-primary-400 underline">Create one</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
