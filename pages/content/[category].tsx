import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import ContentVideoCard from '@/components/ContentVideoCard';
import Link from 'next/link';

// Static map for category logos
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

        if (videosRes.data?.success) {
          setVideos(videosRes.data.data);
        }

        if (categoriesRes.data?.success) {
          const found = categoriesRes.data.data.find(
            (cat: Category) => cat.slug === category
          );
          setCategoryInfo(found || null);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  // Category Not Found Page
  if (!loading && !categoryInfo) {
    return (
      <Layout title="Category Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The category "<span className="font-semibold">{category}</span>" does not exist or is inactive.
          </p>

          <Link
            href="/"
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={categoryInfo ? `${categoryInfo.name} - Content` : 'Content'}
      description={
        categoryInfo
          ? `${categoryInfo.name} videos from Wisdom Circle – Malahida`
          : 'Content videos from Wisdom Circle – Malahida'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition mb-10"
        >
          <span>←</span>
          <span className="ml-2">Back to Home</span>
        </Link>

        {/* Category Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold flex items-center justify-center text-gray-900 dark:text-white mb-3">

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

                <span
                  className={`bg-gradient-to-r ${categoryInfo.color} bg-clip-text text-transparent`}
                >
                  {categoryInfo.name}
                </span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our {categoryInfo?.name.toLowerCase()} content.
          </p>
        </div>

        {/* Videos Section */}
        {loading ? (
          <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading videos...</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {videos.map((video) => (
              <ContentVideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No videos available in this category yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
