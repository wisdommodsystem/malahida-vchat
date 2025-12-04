import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Settings {
  footerText: string;
  socialLinks: {
    discord?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    axios.get('/api/settings')
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;
          // Ensure socialLinks exists and has default values
          const defaultSocialLinks = {
            discord: 'https://discord.gg/W5qJ4hgFxp',
            instagram: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
            facebook: 'https://web.facebook.com/mazigh.apollo',
            tiktok: 'https://www.tiktok.com/@wisdomcircle1',
          };
          
          setSettings({
            footerText: data.footerText || 'This website does not collect or store personal user information. All content is shared by the community for educational and philosophical discussion.',
            socialLinks: {
              ...defaultSocialLinks,
              ...(data.socialLinks || {}),
            },
          });
        }
      })
      .catch(() => {
        // Use default settings if API fails
        setSettings({
          footerText: 'This website does not collect or store personal user information. All content is shared by the community for educational and philosophical discussion.',
          socialLinks: {
            discord: 'https://discord.gg/W5qJ4hgFxp',
            instagram: 'https://www.instagram.com/wisdom_circle0?igsh=aXFyam5iMWl2ZzZ0',
            facebook: 'https://web.facebook.com/mazigh.apollo',
            tiktok: 'https://www.tiktok.com/@wisdomcircle1',
          },
        });
      });
  }, []);

  if (!settings) {
    return (
      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm">Loading...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-950 dark:to-black text-gray-300 border-t border-gray-800 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5a1 1 0 11-2 0v-5a1 1 0 112 0v5zm-1-8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
              Wisdom Circle – Malahida
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">{settings.footerText}</p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8.586 7.172a4 4 0 015.657 0l1.414 1.414a4 4 0 010 5.657l-2.829 2.829a4 4 0 01-5.657 0l-.707-.707a1 1 0 111.414-1.414l.707.707a2 2 0 002.829 0l2.829-2.829a2 2 0 000-2.829l-1.414-1.414a2 2 0 00-2.829 0 1 1 0 11-1.414-1.414z"/></svg>
              Connect
            </h3>
            <div className="flex flex-col space-y-3">
              {/* SVG Icons */}
              {/* Discord */}
              {settings.socialLinks?.discord && (
                <a
                  href={settings.socialLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="Discord"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.369A18.06 18.06 0 0016.558 3c-.198.35-.423.82-.58 1.19a16.258 16.258 0 00-3.957 0c-.156-.37-.382-.84-.58-1.19-1.45.268-2.91.735-3.76 1.37-2.38 3.45-3.02 6.82-2.69 10.14a18.2 18.2 0 003.94 1.99c.308-.426.655-.986.9-1.43-1.023-.384-1.96-.89-2.67-1.63.224.15.593.358.62.373a12.46 12.46 0 006.69 2.02c2.336-.1 4.517-.72 6.69-2.02.05-.032.249-.147.62-.373-.71.74-1.647 1.246-2.67 1.63.245.444.592 1.004.9 1.43a18.2 18.2 0 003.94-1.99c.36-3.568-.576-6.784-2.69-10.14zM9.6 12.7c-.57 0-1.033-.52-1.033-1.16 0-.64.463-1.16 1.033-1.16.57 0 1.033.52 1.033 1.16 0 .64-.463 1.16-1.033 1.16zm4.8 0c-.57 0-1.033-.52-1.033-1.16 0-.64.463-1.16 1.033-1.16.57 0 1.033.52 1.033 1.16 0 .64-.463 1.16-1.033 1.16z"/></svg>
                  <span>Discord</span>
                </a>
              )}
              {/* Instagram */}
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm5.25-2.75a1 1 0 110 2 1 1 0 010-2z"/></svg>
                  <span>Instagram</span>
                </a>
              )}
              {/* TikTok */}
              {settings.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="TikTok"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 3.5c1.1 1.7 2.9 3 5 3.3v3.1c-1.9-.2-3.6-.9-5-2v6.9a5.5 5.5 0 11-5-5.5v3.1a2.5 2.5 0 102 2.4V3.5h3z"/></svg>
                  <span>TikTok</span>
                </a>
              )}
              {/* Facebook */}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 3h3a1 1 0 011 1v3h-3v2h3v11h-4v-6h-2v6H7V9h6V6h-2V4a1 1 0 011-1z"/></svg>
                  <span>Facebook</span>
                </a>
              )}
              {/* YouTube */}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.8 8.2a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.7.5A3 3 0 002.2 8.2 31.2 31.2 0 001.7 12a31.2 31.2 0 00.5 3.8 3 3 0 002.1 2.1c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a3 3 0 002.1-2.1c.5-1.3.5-3.8.5-3.8s0-2.5-.5-3.8zM10 15.2V8.8l5.2 3.2L10 15.2z"/></svg>
                  <span>YouTube</span>
                </a>
              )}
              {/* X / Twitter */}
              {settings.socialLinks?.twitter && (
                <a
                  href={settings.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h6.6l4.2 6.2L18.8 3H21l-6.4 8.6L21 21h-6.6l-4.4-6.6L5.2 21H3l6.7-8.9L3 3zm5.6 2H6l4.8 7.1L7 19h2.6l4.9-6.9L18 19h2.4l-5.8-8 5.8-7.9h-2.6l-4.7 6.4L8.6 5z"/></svg>
                  <span>X</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 3l-9 11h6v7l9-11h-6V3z"/></svg>
              Quick Links
            </h3>
            <div className="flex flex-col space-y-3">
              <Link href="/articles" className="text-sm text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l8 8-8 8-1.4-1.4L16.2 12 10.6 6.4 12 4z"/></svg>
                <span>Articles</span>
              </Link>
              <Link href="/hedra" className="text-sm text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7-11-7z"/></svg>
                <span>HEDRA Podcasts</span>
              </Link>
              <Link href="/about" className="text-sm text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"/></svg>
                <span>About</span>
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-200 flex items-center space-x-3">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 4a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2H9l-5 3v-3H4a2 2 0 01-2-2V4zm4 4v2h12V8H6z"/></svg>
                <span>Contact</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Wisdom Circle – Malahida. Developed by <span className="text-primary-400 font-semibold">Apollo</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
