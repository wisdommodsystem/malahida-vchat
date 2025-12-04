import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type VisibilityType = 'private' | 'public';

interface Props {
  open: boolean;
  onClose: () => void;
}

const categories = ['علاقات', 'عمل', 'دراسة', 'اكتئاب', 'عائلة', 'أخرى'];

export default function WisdomTalksModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<VisibilityType | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode(null);
    }
  }, [open]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 4000);
  };

  const submitPrivate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch('/api/talks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visibility: 'private',
          text: form.get('text'),
          email: form.get('email'),
          name: form.get('name'),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('تم إرسال مشكلتك بسرية ✅');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const submitPublic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch('/api/talks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visibility: 'public',
          title: form.get('title'),
          text: form.get('text'),
          category: form.get('category'),
          nickname: form.get('nickname'),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('تم النشر بنجاح 🎉');
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-4"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            <div className="w-full max-w-4xl rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 shadow-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">🗣️ Wisdom Talks</h3>
                <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">✕</button>
              </div>
              {!mode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="rounded-xl p-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/15 dark:to-purple-600/15 border border-indigo-500/30 text-right"
                    onClick={() => setMode('private')}
                  >
                    <div className="text-lg font-bold text-gray-900 dark:text-white">إرسال مشكلتك بسرية إلى أبولو</div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">سيتم إرسال مشكلتك إلى أبولو بسرية تامة، حيث سيرد في فيديو مع خبير يناسب حالتك.</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="rounded-xl p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/15 dark:to-teal-600/15 border border-emerald-500/30 text-right"
                    onClick={() => setMode('public')}
                  >
                    <div className="text-lg font-bold text-gray-900 dark:text-white">نشر مشكلتك بشكل عام</div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">شارك مشكلتك مع المجتمع وتلقى آراء وتجارب الآخرين.</p>
                  </motion.button>
                </div>
              )}

              {mode === 'private' && (
                <form onSubmit={submitPrivate} className="mt-4" dir="rtl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" placeholder="الاسم (اختياري)" className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
                    <input name="email" placeholder="البريد الإلكتروني (مطلوب للتواصل)" type="email" required className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
                  </div>
                  <textarea name="text" placeholder="نص المشكلة" required rows={5} className="mt-4 w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setMode(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">رجوع</button>
                    <button disabled={loading} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow hover:shadow-lg transition">إرسال بسرية</button>
                    
                  </div>
                </form>
              )}

              {mode === 'public' && (
                <form onSubmit={submitPublic} className="mt-4" dir="rtl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="title" placeholder="العنوان" required className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
                    <select name="category" required className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right">
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input name="nickname" placeholder="الاسم المستعار" required className="rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right col-span-1 md:col-span-2" />
                  </div>
                  <textarea name="text" placeholder="نص المشكلة" required rows={5} className="mt-4 w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-right" />
                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setMode(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">رجوع</button>
                    <button disabled={loading} className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow hover:shadow-lg transition">نشر علنًا</button>
                  </div>
                </form>
              )}

              {toast && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-gray-900 text-white shadow-lg"
                >
                  {toast}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}