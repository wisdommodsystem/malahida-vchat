import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from './Footer';
import Navbar from './Navbar';
import Script from 'next/script';
import axios from 'axios';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

export default function Layout({ children, title, description, keywords }: LayoutProps) {
  const router = useRouter();
  const [myUsername, setMyUsername] = useState('');
  const [showDiscordModal, setShowDiscordModal] = useState(true);
  const siteTitle = title 
    ? `${title} | Wisdom Circle – Malahida`
    : 'Wisdom Circle – Malahida | Philosophy, Freethought & Amazigh Intellectual Culture';
  
  const siteDescription = description || 
    'A community dedicated to philosophy, freethought, atheism, rationalism, and Amazigh intellectual culture. Moroccan atheists, Amazigh philosophers, freethinkers, and rationalists.';
  
  const siteKeywords = keywords || 
    [
      // English
      'Malahida', 'Moroccan atheists', 'Amazigh', 'Amazigh philosophy', 'atheism', 'freethought', 'rationalism', 'secularism', 'individual freedoms', 'Wisdom Circle podcast', 'Discord community',
      // Arabic (script)
      'اللادينيين في المغرب', 'الملاحدة', 'الفكر الحر', 'العقلانية', 'العلمانية', 'الأمازيغية', 'الفلسفة الأمازيغية', 'الحريات الفردية', 'بودكاست ويسدوم سيركل', 'مجتمع ديسكورد',
      // Arabic transliteration (Latin)
      'Al-ladiniyyin fi al-Maghrib', 'Al-mulahida', 'Al-fikr al-hurr', 'Al-`aqlaniya', 'Al-`ilmaniya', 'Amazighiya', 'Al-falsafa al-Amazighiya', 'Al-hurriyat al-fardiya',
    ].join(', ');

  useEffect(() => {
    try {
      axios.get('/api/profile').then((res) => {
        const u = res.data?.data?.username || '';
        setMyUsername(u);
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }).catch(() => {
        setMyUsername('');
      });
    } catch {}
  }, [router]);

  useEffect(() => {
    const channel = supabaseClient
      .channel('messages-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        try {
          const row = payload.new as any;
          const isMine = Boolean(myUsername) && row.username === myUsername;
          const isMention = Boolean(myUsername) && typeof row.message === 'string' && row.message.includes(`@${myUsername}`);
          const canNotify = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
          const onChatPage = router.pathname === '/chat';
          if (canNotify && !onChatPage && (!isMine || isMention)) {
            const n = new Notification(`رسالة جديدة من ${row.username}`.trim(), {
              body: typeof row.message === 'string' ? row.message : '',
              icon: 'https://i.postimg.cc/1X42P1sw/image.png',
            });
            n.onclick = () => {
              window.focus();
              router.push('/chat');
            };
          }
        } catch {}
      })
      .subscribe();
    return () => { supabaseClient.removeChannel(channel); };
  }, [myUsername, router]);

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Wisdom Circle – Malahida" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Wisdom Circle – Malahida" />
        <meta property="og:image" content="https://i.postimg.cc/1X42P1sw/image.png" />
        <meta property="og:locale" content="ar_MA" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content="https://i.postimg.cc/1X42P1sw/image.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="https://i.postimg.cc/1X42P1sw/image.png" />
        <link rel="apple-touch-icon" href="https://i.postimg.cc/1X42P1sw/image.png" />
        <link rel="mask-icon" href="https://i.postimg.cc/1X42P1sw/image.png" color="#0ea5e9" />
        <link rel="dns-prefetch" href="https://i.postimg.cc" />
        <link rel="preconnect" href="https://i.postimg.cc" />

        {/* Podcast & Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PodcastSeries',
              name: 'Wisdom Circle – Malahida',
              description: 'A bilingual (Arabic-English) podcast covering freethought, atheism, rationalism, Amazigh culture, and individual freedoms in Morocco. Community discussions continue on Discord.',
              inLanguage: ['ar', 'en'],
              publisher: {
                '@type': 'Organization',
                name: 'Wisdom Circle – Malahida',
                areaServed: 'MA',
                keywords: siteKeywords,
              },
              image: 'https://i.postimg.cc/1X42P1sw/image.png',
              url: 'https://wisdom-circle.local',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Wisdom Circle – Malahida',
              description: 'Freethinkers, atheists, rationalists, and Amazigh intellectuals. Community on Discord and podcast for public philosophy and individual freedoms.',
              areaServed: 'MA',
              sameAs: [
                'https://discord.com',
              ],
              logo: 'https://i.postimg.cc/1X42P1sw/image.png',
            }),
          }}
        />
        {/* Fonts: Inter (UI), Poppins (headings), Merriweather (reading) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=Merriweather:wght@300;400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap"
          rel="stylesheet"
        />

      </Head>
      <Script id="cpb-settings" strategy="afterInteractive">
        {`var MHHRO_Jaz_soLtgc={"it":4545534,"key":"cb8e1"};`}
      </Script>
      <Script src="https://da4talg8ap14y.cloudfront.net/3013227.js" strategy="afterInteractive" />
      <Script id="sw-register" strategy="afterInteractive">
        {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(function(){}); }`}
      </Script>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <button
        onClick={() => {
          const fn = (typeof window !== 'undefined' && (window as any)._gu) ? (window as any)._gu : null;
          if (fn) fn();
        }}
        className="fixed bottom-6 right-6 z-50 rounded-2xl px-4 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg"
      >
        دعم فابور ☕
      </button>
      {showDiscordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-[101] w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join our server discord</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">And enjoy talking with open minded people</p>
              <div className="flex items-center justify-end gap-3">
                <a
                  href="https://discord.gg/chxc7nEAy2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow"
                >
                  Join Discord
                </a>
                <button
                  onClick={() => setShowDiscordModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
