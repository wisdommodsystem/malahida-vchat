import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import connectDB from '../../lib/mongodb';
import TalkModel, { ITalk } from '../../models/Talk';

interface Comment {
  id: string;
  nickname: string;
  text: string;
  date: string;
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
  comments: Comment[];
  status: 'pending' | 'approved' | 'responded' | 'deleted';
  slug?: string;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.slug as string;
  await connectDB();

  let doc: ITalk | null = null;
  // حاول أولًا عبر الحقل slug ثم عبر المعرّف مباشرةً
  doc = (await TalkModel.findOne({ slug, visibility: 'public', status: { $ne: 'deleted' } }).lean()) as any;
  if (!doc) {
    try {
      doc = (await TalkModel.findById(slug).lean()) as any;
    } catch {}
  }

  if (!doc || doc.visibility !== 'public' || doc.status === 'deleted') {
    return { notFound: true };
  }

  const talk: Talk = {
    id: (doc as any)._id.toString(),
    title: doc.title || 'مشاركة خاصة',
    text: doc.text,
    nickname: doc.nickname || 'مجهول',
    category: doc.category || 'أخرى',
    visibility: doc.visibility,
    date: (doc.date || (doc as any).createdAt || new Date()).toISOString(),
    likes: doc.likes || 0,
    comments: (doc.comments || []).map((c: any) => ({
      id: (c._id || '').toString(),
      nickname: c.nickname || 'مجهول',
      text: c.text,
      date: (c.date || new Date()).toISOString(),
    })),
    status: doc.status,
    slug: doc.slug,
  };

  return { props: { talk } };
};

export default function TalkDetail({ talk }: { talk: Talk }) {
  const [likes, setLikes] = useState(talk.likes || 0);
  const [comments, setComments] = useState<Comment[]>(talk.comments || []);

  const toggleLike = async () => {
    const res = await fetch(`/api/talks/${talk.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ likes: likes + 1 })
    });
    const json = await res.json();
    if (json.success) setLikes(json.data.likes);
  };

  const addComment = async (nickname: string, text: string) => {
    const res = await fetch(`/api/talks/${talk.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: { nickname, text } })
    });
    const json = await res.json();
    if (json.success) setComments(json.data.comments);
  };

  const description = `${talk.title} — ${talk.category} — بقلم ${talk.nickname}`;
  const ogImage = 'https://i.postimg.cc/1X42P1sw/image.png';

  return (
    <Layout title={`Wisdom Talks – ${talk.title}`} description={description}>
      <Head>
        <meta property="og:title" content={`Wisdom Talks – ${talk.title}`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`https://example.com/talks/${encodeURIComponent(talk.slug || talk.id)}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Article',
          headline: talk.title, articleSection: talk.category,
          datePublished: talk.date, author: { '@type': 'Person', name: talk.nickname },
          interactionStatistic: [{ '@type': 'InteractionCounter', interactionType: { '@type': 'LikeAction' }, userInteractionCount: likes }],
          commentCount: comments.length
        }) }} />
      </Head>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <nav className="text-sm text-gray-600 dark:text-gray-300 mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li>/</li>
            <li><Link href="/talks" className="hover:underline">Wisdom Talks</Link></li>
            <li>/</li>
            <li className="font-semibold" dir="rtl">{talk.title}</li>
          </ol>
        </nav>

        <article className="rounded-2xl p-6 bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 shadow-sm" dir="rtl">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-right">{talk.title}</h1>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 text-right">👤 {talk.nickname} • 📅 {new Date(talk.date).toLocaleDateString()} • 🧩 {talk.category}</div>
          <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed text-right">{talk.text}</p>
          <div className="mt-4 flex items-center gap-3 justify-end">
            <button onClick={toggleLike} className="flex items-center gap-1 text-gray-700 dark:text-gray-300"><span>❤️</span><span>{likes}</span></button>
          </div>
        </article>

        <section className="mt-6" dir="rtl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right">💭 التعليقات</h2>
          <div className="mt-3 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl p-3 bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-right">
                <div className="text-sm text-gray-600 dark:text-gray-300">👤 {c.nickname} • {new Date(c.date).toLocaleString()}</div>
                <div className="mt-1 text-gray-800 dark:text-gray-200">{c.text}</div>
              </div>
            ))}
          </div>

          <CommentForm onSubmit={addComment} />
        </section>
      </div>
    </Layout>
  );
}

function CommentForm({ onSubmit }: { onSubmit: (n: string, t: string) => void }) {
  const [n, setN] = useState('');
  const [t, setT] = useState('');
  return (
    <div className="mt-4 rounded-xl p-4 bg-white/70 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={n} onChange={(e) => setN(e.target.value)} placeholder="اسم مستعار" className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="نص التعليق" className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right md:col-span-2" />
      </div>
      <div className="mt-2 flex justify-end">
        <button onClick={() => onSubmit(n, t)} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">إضافة تعليق</button>
      </div>
    </div>
  );
}
