import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  active: boolean;
}

type SidebarMode = 'card' | 'drawer';

export default function ContentSidebar({ mode = 'card' }: { mode?: SidebarMode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Map static logos for known categories
  const iconMap: Record<string, string> = {
    comedy: 'https://i.postimg.cc/fbHv3v1L/unnamed-removebg-preview.png',
    gaming: 'https://i.postimg.cc/bNCYBSXk/image.png',
    debates: 'https://i.postimg.cc/MTnKxWy3/image.png',
    podcasts: 'https://i.postimg.cc/qB8HKhMc/image.png',
    competitions: 'https://i.postimg.cc/h4wQXYvq/image.png',
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories?active=true');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { _id: '1', name: 'Comedy', slug: 'comedy', icon: '😄', color: 'from-yellow-400 to-orange-500', active: true },
          { _id: '2', name: 'Gaming', slug: 'gaming', icon: '🎮', color: 'from-purple-400 to-pink-500', active: true },
          { _id: '3', name: 'Debates', slug: 'debates', icon: '💬', color: 'from-blue-400 to-cyan-500', active: true },
          { _id: '4', name: 'Podcasts', slug: 'podcasts', icon: '🎙️', color: 'from-green-400 to-emerald-500', active: true },
          { _id: '5', name: 'Competitions', slug: 'competitions', icon: '🏆', color: 'from-amber-400 to-yellow-500', active: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const containerClasses =
    mode === 'drawer'
      ? 'w-full h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900'
      : 'w-full lg:w-72 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl p-6 mb-8 sticky top-24';

  const innerPadding = mode === 'drawer' ? 'p-3' : '';

  return (
    <div className={containerClasses}>
      <div className={innerPadding}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-gray-900 dark:text-white text-xl mb-4 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 group"
      >
        <span className="flex items-center space-x-2">
          <span className="text-2xl">📚</span>
          <span>Content</span>
        </span>
        <span className={`transform transition-transform duration-300 text-primary-600 dark:text-primary-400 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6H6z"/></svg>
        </span>
      </button>
      
      {isOpen && (
        <nav className="mt-4 space-y-2 animate-fadeIn">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
            </div>
          ) : categories.length > 0 ? (
            categories.map((category) => {
              const isActive = router.pathname === `/content/${category.slug}`;
              return (
                <Link
                  key={category._id}
                  href={`/content/${category.slug}`}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:transform hover:scale-102'
                  }`}
                >
                  {iconMap[category.slug] ? (
                    <img
                      src={iconMap[category.slug]}
                      alt={category.name}
                      className="w-8 h-8 rounded-md object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                    />
                  ) : (
                    <span className="text-xl">{category.icon}</span>
                  )}
                  <span className="font-semibold">{category.name}</span>
                  {isActive && (
                    <span className="ml-auto">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l8 8-8 8-1.4-1.4L16.2 12 10.6 6.4 12 4z"/></svg>
                    </span>
                  )}
                </Link>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No categories available</p>
            </div>
          )}
        </nav>
      )}
      </div>
    </div>
  );
}

