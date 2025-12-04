import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import TalkCard, { Talk } from '@/components/TalkCard';
import WisdomTalksModal from '@/components/WisdomTalksModal';

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'popular' | 'newest' | 'oldest'>('popular');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openModal') === '1') setOpenModal(true);
  }, []);

  const fetchTalks = async () => {
    const res = await fetch('/api/talks?public=1');
    const json = await res.json();
    if (json.success) setTalks(json.data);
  };

  useEffect(() => {
    fetchTalks();
  }, []);

  const filtered = useMemo(() => {
    let list = talks;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((t) => (t.title + ' ' + t.text + ' ' + t.category + ' ' + t.nickname).toLowerCase().includes(q));
    }
    switch (sort) {
      case 'popular':
        return [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'newest':
        return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      default:
        return list;
    }
  }, [talks, query, sort]);

  return (
    <Layout title="Wisdom Talks" description="شارك مشكلتك مع المجتمع وتلقى آراء وتجارب الآخرين.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 dark:text-gray-300 mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li className="font-semibold">Wisdom Talks</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">🗣️ Wisdom Talks</h1>
          <button onClick={() => setOpenModal(true)} className="px-4 py-2 rounded-2xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">شارك مشكلتك</button>
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl p-4 bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-800 mb-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن موضوع أو كلمة..." className="rounded-xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right">
              <option value="popular">الأكثر تفاعلًا</option>
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
            </select>
            <div className="flex justify-end">
              <Link href={{ pathname: '/talks', query: { openModal: '1' } }} className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">ابدأ الآن</Link>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <TalkCard key={t.id} talk={t} onUpdate={(u) => setTalks((prev) => prev.map((p) => (p.id === u.id ? u : p)))} />
          ))}
        </div>

        {/* Scroll to top */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-40 rounded-full p-3 bg-gray-900 text-white shadow hover:shadow-lg">↑</button>

        {/* Floating widget */}
        <button onClick={() => setOpenModal(true)} className="fixed bottom-6 right-20 z-40 rounded-2xl px-4 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg">✨ شارك مشكلتك أنت أيضًا!</button>

        <WisdomTalksModal open={openModal} onClose={() => { setOpenModal(false); fetchTalks(); }} />
      </div>
    </Layout>
  );
}
