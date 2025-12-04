import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const cities = [
  'Casablanca','Rabat','Fes','Marrakesh','Tangier','Agadir','Meknes','Oujda','Kenitra','Tetouan','Safi','El Jadida','Nador','Temara','Mohammedia','Khouribga','Beni Mellal','Taza','Ait Melloul','Inezgane','Berrechid','Khemisset','Ouarzazate','Taroudant','Guelmim','Tifelt','Errachidia','Tiznit','Sidi Slimane','Sidi Kacem','Settat','Sale','Laayoune','Al Hoceima','Chefchaouen','Dakhla','Azrou','Khenifra','Oulad Teima','Sidi Bennour','Youssoufia','Skhirat','Souk El Arbaa','Fnideq','Martil','Tinghir','Midelt','Zagora','Taounate','Ouazzane','Guercif','Berkane','Fquih Ben Salah','Kalaat Sraghna','Chichaoua','Sidi Ifni','Essaouira'
];

export default function CreateProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/profile').then((res) => {
      if (res.data?.success && res.data?.data) {
        const p = res.data.data;
        setUsername(p.username || '');
        setDisplayName(p.display_name || '');
        setAge(p.age || '');
        setGender(p.gender || '');
        setCity(p.city || '');
        setBio(p.bio || '');
        setImageUrl(p.image_url || '');
      }
    }).catch(() => {});
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError('الصورة كبيرة جداً (الحد 10MB)');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await axios.post('/api/upload-profile-picture', { imageBase64: base64, filename: file.name });
        if (res.data?.success) setImageUrl(res.data.data.url);
        else setError(res.data?.error || 'تعذر رفع الصورة');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'تعذر رفع الصورة');
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await axios.post('/api/profile', {
        display_name: displayName,
        age: age === '' ? null : Number(age),
        gender,
        city,
        bio,
        image_url: imageUrl,
      });
      if (res.data?.success) router.push('/community');
      else setError(res.data?.error || 'Save failed');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Create Profile" description="Join the Wisdom Community">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Profile</h1>
        <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture</label>
            <div className="flex items-center gap-3">
              {imageUrl && <img src={imageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />}
              <input type="file" accept="image/*" onChange={onFileChange} />
            </div>
            {uploading && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Uploading...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} readOnly className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Name / Nickname</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="number" min={12} max={120} value={age} onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <option value="">Select</option>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Short Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
          </div>
          <button type="submit" disabled={saving} className="w-full px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
