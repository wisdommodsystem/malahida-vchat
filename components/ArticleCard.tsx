import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    author: string;
    slug: string;
    imageUrl?: string;
    views: number;
    createdAt: string;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const arabicRegex = /[\u0600-\u06FF]/;
  const isArabicTitle = arabicRegex.test(article.title);
  return (
    <Link href={`/articles/${article.slug}-${article._id}`}>
      <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-1 overflow-hidden" dir={isArabicTitle ? 'rtl' : 'ltr'}>
        {/* Thumbnail: show image if provided, else placeholder */}
        {article.imageUrl ? (
          <div className="h-40 overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-primary-700/20 dark:from-primary-500/15 dark:via-primary-600/10 dark:to-primary-700/15 flex items-center justify-center">
            <div className="w-16 h-16 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {article.title.charAt(0)}
              </span>
            </div>
          </div>
        )}
        <div className="p-6">
        <h2 className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${isArabicTitle ? 'text-right' : ''}`}>
          {article.title}
        </h2>
        <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="font-medium">By {article.author}</span>
          <div className="flex items-center space-x-4">
            <span className="text-xs">{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
            <span className="flex items-center space-x-1 text-primary-600 dark:text-primary-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 5c-5 0-9 4-10 7 1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"/></svg>
              <span className="font-semibold">{article.views}</span>
            </span>
          </div>
        </div>
        </div>
      </div>
    </Link>
  );
}
