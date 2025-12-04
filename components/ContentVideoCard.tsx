import React from 'react';

interface ContentVideoCardProps {
  video: {
    _id: string;
    title: string;
    youtubeId: string;
    thumbnail?: string;
    description?: string;
    createdAt: string;
  };
}

export default function ContentVideoCard({ video }: ContentVideoCardProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
            <svg className="w-7 h-7 text-primary-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7-11-7z"/></svg>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {video.description}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {new Date(video.createdAt).toLocaleDateString()}
        </p>
      </div>
    </a>
  );
}

