import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import connectDB from '@/lib/mongodb';
import ArticleModel, { IArticle } from '@/models/Article';
import Image from 'next/image'; // ✅ مضافة

interface ArticleProps {
  article: {
    _id: string;
    title: string;
    content: string;
    author: string;
    imageUrl?: string;
    views: number;
    createdAt: string;
    slug: string;
  };
  related: Array<{
    _id: string;
    title: string;
    author: string;
    slug: string;
    imageUrl?: string;
    createdAt: string;
  }>;
  canonicalURL: string;
  shortDescription: string;
}

export default function ArticlePage({ article, related, canonicalURL, shortDescription }: ArticleProps) {
  const arabicRegex = /[\u0600-\u06FF]/;

  const ogImage = article.imageUrl || 'https://i.postimg.cc/1X42P1sw/image.png';

  return (
    <Layout
      title={article.title}
      description={shortDescription}
    >
      <Head>
        <title>{article.title}</title>
        <meta name="description" content={shortDescription} />
        <link rel="canonical" href={canonicalURL} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={shortDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalURL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={shortDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.title,
              author: article.author,
              datePublished: article.createdAt,
              image: ogImage,
              description: shortDescription,
              url: canonicalURL,
            }),
          }}
        />
      </Head>

      <article
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        dir={arabicRegex.test(article.title) || arabicRegex.test(article.content) ? 'rtl' : 'ltr'}
      >
        {/* MAIN IMAGE */}
        <div className="rounded-2xl overflow-hidden shadow-sm mb-10 border border-gray-200 dark:border-gray-800">
          {article.imageUrl ? (
            <div className="h-60 w-full overflow-hidden relative">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}

          <div className="bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-primary-700/20 dark:from-primary-500/15 dark:via-primary-600/10 dark:to-primary-700/15 p-8">
            <h1
              className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight ${
                arabicRegex.test(article.title) ? 'text-right' : ''
              }`}
            >
              {article.title}
            </h1>

            <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-4">
                <span>By {article.author}</span>
                <span>•</span>
                <time dateTime={article.createdAt}>
                  {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                </time>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-primary-600 dark:text-primary-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 5c-5 0-9 4-10 7 1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>{article.views} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div
          className={`prose prose-lg max-w-none bg-[#fafaf7] dark:bg-[#0f141a] border border-gray-100 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-md dark:text-[18px] md:dark:text-[19px] ${
            arabicRegex.test(article.content) ? 'prose-ar' : ''
          }`}
        >
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* RELATED ARTICLES */}
        {related?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              📚 Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((ra) => (
                <Link
                  key={ra._id}
                  href={`/articles/${ra.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  {ra.imageUrl ? (
                    <div className="h-32 overflow-hidden relative">
                      <Image
                        src={ra.imageUrl}
                        alt={ra.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {ra.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">By {ra.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link href="/articles" className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Back to Articles
          </Link>
        </div>
      </article>
    </Layout>
  );
}

function stripMarkdown(md: string) {
  return md
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/\[[^\]]*\]\([^\)]+\)/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { slug } = ctx.query as { slug: string };
  await connectDB();

  const match = slug.match(/^(.*)-([a-f0-9]{24})$/i);
  let articleDoc: IArticle | null = null as any;

  if (match) {
    const [, , id] = match;
    articleDoc = await ArticleModel.findById(id);
    if (!articleDoc || !articleDoc.approved) {
      articleDoc = await ArticleModel.findOne({ slug: match[1], approved: true });
    }
  } else {
    articleDoc = await ArticleModel.findOne({ slug, approved: true });
  }

  if (!articleDoc) {
    return { notFound: true };
  }

  articleDoc.views += 1;
  await articleDoc.save();

  const proto = (ctx.req.headers['x-forwarded-proto'] as string) || 'http';
  const host = ctx.req.headers.host || 'localhost:3002';
  const canonicalURL = `${proto}://${host}/articles/${articleDoc.slug}-${articleDoc._id}`;

  const shortDescription = stripMarkdown(articleDoc.content).slice(0, 160);

  const relatedDocs = await ArticleModel.find({
    approved: true,
    _id: { $ne: articleDoc._id },
  })
    .sort({ createdAt: -1 })
    .select('title author slug imageUrl createdAt')
    .limit(3)
    .lean();

  return {
    props: {
      article: {
        _id: articleDoc._id.toString(),
        title: articleDoc.title,
        content: articleDoc.content,
        author: articleDoc.author,
        imageUrl: articleDoc.imageUrl || null,
        views: articleDoc.views,
        createdAt: articleDoc.createdAt.toISOString(),
        slug: articleDoc.slug,
      },
      related: relatedDocs.map((d: any) => ({
        _id: d._id.toString(),
        title: d.title,
        author: d.author,
        slug: `${d.slug}-${d._id.toString()}`,
        imageUrl: d.imageUrl || null,
        createdAt: d.createdAt?.toISOString?.() || new Date().toISOString(),
      })),
      canonicalURL,
      shortDescription,
    },
  };
};
