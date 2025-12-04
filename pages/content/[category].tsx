import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import ContentVideoCard from '@/components/ContentVideoCard';
import Link from 'next/link';

// Static map for category logos (same as sidebar)
const iconMap: Record<string, string> = {
  comedy: 'https://i.postimg.cc/fbHv3v1L/unnamed-removebg-preview.png',
  gaming: 'https://i.postimg.cc/bNCYBSXk/image.png',
  debates: 'https://i.postimg.cc/MTnKxWy3/image.png',
  podcasts: 'https://i.postimg.cc/qB8HKhMc/image.png',
  competitions: 'https://i.postimg.cc/h4wQXYvq/image.png',
};

interface Video {
  _id: string;
  title: string;
  youtubeId: string;
  thumbnail?: string;
  description?: string;
  category: string;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export default function ContentCategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [videos, setVideos] = useState<Video[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchData = async () => {
      try {
        const [videosRes, categoriesRes] = await Promise.all([
          axios.get(`/api/videos?category=${category}`),
          axios.get('/api/categories?active=true'),
        ]);

        if (videosRes.data.success) {
          setVideos(videosRes.data.data);
        }

        if (categoriesRes.data.success) {
          const foundCategory = categoriesRes.data.data.find(
            (cat: Category) => cat.slug === category
          );
          if (foundCategory) {
            setCategoryInfo(foundCategory);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  if (!loading && !categoryInfo && category) {
    return (
      <Layout title="Content Category">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Category Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The category "{category}" does not exist or is inactive.
            </p>
            <Link href="/" className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center space-x-2">
              <span>←</span>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={categoryInfo ? `${categoryInfo.name} - Content` : 'Content Category'}
      description={categoryInfo ? `${categoryInfo.name} videos from Wisdom Circle – Malahida` : 'Content videos from Wisdom Circle – Malahida'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-12">
          <Link
            href="/"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold mb-6 inline-flex items-center space-x-2 transition-colors duration-200"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <div className="text-center mt-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
              {categoryInfo && (
                <>
                  {iconMap[categoryInfo.slug] ? (
                    <img
                      src={iconMap[categoryInfo.slug]}
                      alt={categoryInfo.name}
                      className="mr-5 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                    />
                  ) : (
                    <span className="mr-4 text-5xl md:text-6xl">{categoryInfo.icon}</span>
                  )}
                  <span className={`bg-gradient-to-r ${categoryInfo.color} bg-clip-text text-transparent`}>
                    {categoryInfo.name}
                  </span>
                </>
              )}
              {!categoryInfo && (
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                  {category}
                </span>
              )}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our {categoryInfo ? categoryInfo.name.toLowerCase() : category} content
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {videos.map((video) => (
              <ContentVideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No videos available in this category yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

