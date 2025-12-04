import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Comment {
  id: string;
  nickname: string;
  text: string;
  date: string;
}

export interface Talk {
  id: string;
  title: string;
  text: string;
  nickname: string;
  category: string;
  visibility: 'public' | 'private';
  date: string;
  likes: number;
  comments: Comment[];
  status: 'pending' | 'approved' | 'responded' | 'deleted';
  slug?: string;
}

interface Props {
  talk: Talk;
  onUpdate: (updated: Talk) => void;
}

export default function TalkCard({ talk, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [nickname, setNickname] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const key = `talk_like_${talk.id}`;
    setLiked(localStorage.getItem(key) === '1');
  }, [talk.id]);

  const toggleLike = async () => {
    const key = `talk_like_${talk.id}`;
    const nextLiked = !liked;
    setLiked(nextLiked);
    localStorage.setItem(key, nextLiked ? '1' : '0');

    const newLikes = (talk.likes || 0) + (nextLiked ? 1 : -1);
    const res = await fetch(`/api/talks/${talk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: newLikes }),
    });
    const json = await res.json();
    if (json.success) onUpdate(json.data);
  };

  const addComment = async () => {
    if (!nickname || !commentText) return;
    const res = await fetch(`/api/talks/${talk.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: { nickname, text: commentText } }),
    });
    const json = await res.json();
    if (json.success) {
      onUpdate(json.data);
      setNickname('');
      setCommentText('');
    }
  };

  return (
    <motion.article
      className="rounded-2xl p-5 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-2">
        <a href={`/talks/${encodeURIComponent(talk.slug || talk.id)}`} className="text-lg font-bold text-gray-900 dark:text-white">
          {talk.title}
        </a>
        <span className="px-3 py-1 rounded-full text-xs bg-primary-100 dark:bg-primary-800/40 text-primary-700 dark:text-primary-300">
          {talk.category}
        </span>
      </div>
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        <span className="mr-2">👤 {talk.nickname}</span>
        <span>📅 {new Date(talk.date).toLocaleDateString()}</span>
      </div>

      <p className={`mt-3 text-gray-700 dark:text-gray-200 ${expanded ? '' : 'line-clamp-3'}`} dir="rtl">
        {talk.text}
      </p>
      <button onClick={() => setExpanded((e) => !e)} className="mt-2 text-primary-600 dark:text-primary-400 hover:underline">
        {expanded ? 'إخفاء' : 'قراءة المزيد'}
      </button>

      <div className="mt-4 flex items-center gap-4">
        <button onClick={toggleLike} className={`flex items-center gap-1 ${liked ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
          <span>❤️</span>
          <span>{talk.likes}</span>
        </button>
        <div className="text-gray-600 dark:text-gray-300">💭 {talk.comments?.length || 0}</div>
      </div>

      {expanded && (
        <div className="mt-4" dir="rtl">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التعليقات</h5>
          {(!talk.comments || talk.comments.length === 0) ? (
            <p className="text-gray-600 dark:text-gray-400">لا توجد تعليقات بعد.</p>
          ) : (
            <ul className="space-y-3">
              {talk.comments.map((c) => (
                <li key={c.id} className="rounded-lg p-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span className="mr-2">👤 {c.nickname}</span>
                    <span>📅 {new Date(c.date).toLocaleString('ar-MA')}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{c.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="اسم مستعار" className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="نص التعليق" className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right md:col-span-2" />
        </div>
        <div className="mt-2 flex justify-end">
          <button onClick={addComment} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">إضافة تعليق</button>
        </div>
      </div>
    </motion.article>
  );
}