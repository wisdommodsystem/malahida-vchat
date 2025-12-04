import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import ArticleCard from '@/components/ArticleCard';
import Link from 'next/link';

interface Article {
  _id: string;
  title: string;
  author: string;
  slug: string;
  imageUrl?: string;
  views: number;
  createdAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('/api/articles');
        if (res.data.success) {
          setArticles(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Layout
      title="Wisdom Circle – Articles"
      description="Explore philosophical writings, freethought discussions, and reflective essays by Wisdom Circle authors."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Articles</h1>
            <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-gray-300">Philosophy, freethought, rationalism, and Amazigh culture — curated by the community.</p>
          </div>
          <Link
            href="/articles/new"
            className="mt-4 md:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md transition-colors shadow-sm hover:shadow-md"
          >
            Submit Article
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-700 dark:text-gray-300">Loading articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-700 dark:text-gray-300 mb-4">No articles yet.</p>
            <Link
              href="/articles/new"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Be the first to submit an article!
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

