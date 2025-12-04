import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ProfileCard {
  username: string;
  display_name?: string;
  age?: number;
  gender?: string;
  city?: string;
  bio?: string;
  image_url?: string;
}

const cities = [
  'Casablanca','Rabat','Fes','Marrakesh','Tangier','Agadir','Meknes','Oujda','Kenitra','Tetouan','Safi','El Jadida','Nador','Temara','Mohammedia','Khouribga','Beni Mellal','Taza','Ait Melloul','Inezgane','Berrechid','Khemisset','Ouarzazate','Taroudant','Guelmim','Tifelt','Errachidia','Tiznit','Sidi Slimane','Sidi Kacem','Settat','Sale','Laayoune','Al Hoceima','Chefchaouen','Dakhla'
];

export default function CommunityPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [selected, setSelected] = useState<ProfileCard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mentionsByUser, setMentionsByUser] = useState<Record<string, number>>({});
  const [myUsername, setMyUsername] = useState('');
  const [myNotifications, setMyNotifications] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    axios.get('/api/profile').then((res) => {
      const u = res.data?.data?.username || '';
      setMyUsername(u);
    }).catch(() => {
      router.replace('/login?next=/community');
    });
  }, [router]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    const installedHandler = () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      const params: any = {};
      if (city) params.city = city;
      if (gender) params.gender = gender;
      if (minAge !== '') params.minAge = minAge;
      if (maxAge !== '') params.maxAge = maxAge;
      try {
        setLoading(true);
        const res = await axios.get('/api/profiles', { params });
        if (res.data?.success) setProfiles(res.data.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [city, gender, minAge, maxAge]);

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        const res = await axios.get('/api/messages');
        const msgs: Array<{ username: string; message: string }> = res.data?.data || [];
        const map: Record<string, number> = {};
        profiles.forEach((p) => {
          const uname = p.username || '';
          if (!uname) return;
          const tag = `@${uname}`;
          map[uname] = msgs.reduce((acc, m) => acc + (typeof m.message === 'string' && m.message.includes(tag) ? 1 : 0), 0);
        });
        setMentionsByUser(map);
        if (myUsername) {
          const myTag = `@${myUsername}`;
          const mine = msgs.reduce((acc, m) => acc + (typeof m.message === 'string' && m.message.includes(myTag) ? 1 : 0), 0);
          setMyNotifications(mine);
        }
      } catch {}
    };
    if (profiles.length > 0) fetchMentions();
  }, [profiles, myUsername]);

  const openProfile = (p: ProfileCard) => {
    setSelected(p);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const displayList = useMemo(() => profiles, [profiles]);

  const onLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } finally {
      router.replace('/login?next=/community');
    }
  };

  return (
    <Layout title="Community" description="Explore Wisdom Community profiles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
          <div className="flex items-center gap-3">
            <Link href="/create-profile" className="px-3 py-1.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow">My Profile</Link>
            <div className="relative inline-flex items-center" title="My Notifications">
              <span className="text-xl">🔔</span>
              {myNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{myNotifications}</span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{profiles.length} profiles</div>
            <button onClick={onLogout} className="px-3 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 shadow">Logout</button>
          </div>
        </div>
        {showInstallBanner && deferredPrompt && (
          <div className="mb-6 rounded-2xl p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 flex items-center justify-between">
            <div className="text-sm md:text-base text-primary-800 dark:text-primary-200">Add Wisdom Chat to Home Screen / Desktop</div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    setShowInstallBanner(false);
                    setDeferredPrompt(null);
                  } catch {}
                }}
                className="px-3 py-1.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow"
              >
                Add
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Later</button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <option value="">All</option>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min Age</label>
            <input type="number" min={12} max={120} value={minAge} onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Age</label>
            <input type="number" min={12} max={120} value={maxAge} onChange={(e) => setMaxAge(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mt-4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6 mt-2" />
            </div>
          ))}

          {!loading && displayList.map((p) => {
            const display = p.display_name || p.username;
            const normalizeUrl = (u: string) => u.trim().replace(/\)$/, '');
            const avatarSrc = normalizeUrl(p.image_url || 'https://i.postimg.cc/0jYVJmWj/user.png');
            const genderColor = p.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' : p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            return (
              <div key={p.username} className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition">
                <div className="h-24 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/30" />
                <div className="p-4 -mt-10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full ring-2 ring-primary-500/40 shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image src={avatarSrc} alt={display} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{display}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {p.city || 'Unknown'}{p.age ? ` • ${p.age}` : ''}
                      </div>
                    </div>
                    {p.gender && (
                      <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${genderColor}`}>{p.gender}</span>
                    )}
                  </div>
                  {p.bio && <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{p.bio}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="relative inline-flex items-center" title="Mentions">
                      <span className="text-xl">🔔</span>
                      {Boolean(mentionsByUser[p.username || '']) && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {mentionsByUser[p.username || '']}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openProfile(p)} className="text-sm px-3 py-1.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow hover:shadow-md transition">Profile</button>
                      <Link href="/chat" className="text-sm px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-md transition">Say hi in Chat</Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && displayList.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <p className="text-gray-600 dark:text-gray-400">No profiles found</p>
              <button onClick={() => { setCity(''); setGender(''); setMinAge(''); setMaxAge(''); }} className="mt-4 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">Reset filters</button>
            </div>
          )}
        </div>
        {showModal && selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full ring-2 ring-primary-500/40 shadow-sm overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image src={(selected.image_url || 'https://i.postimg.cc/0jYVJmWj/user.png').trim().replace(/\)$/, '')} alt={selected.username} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{selected.display_name || selected.username}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selected.city || 'Unknown'}{selected.age ? ` • ${selected.age}` : ''}</div>
                </div>
                <button onClick={closeModal} className="ml-auto px-3 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Close</button>
              </div>
              <div className="mt-4">
                {selected.gender && (
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    (selected.gender || '').toLowerCase() === 'female'
                      ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
                      : (selected.gender || '').toLowerCase() === 'male'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>{selected.gender}</span>
                )}
              </div>
              {selected.bio && (
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{selected.bio}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
