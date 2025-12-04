import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';

interface Settings {
  aboutText: string;
  communityDescription: string;
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/settings')
      .then((res) => {
        if (res.data.success) {
          setSettings(res.data.data);
        }
      })
      .catch(() => {
        setSettings({
          aboutText: 'Wisdom Circle – Malahida is a community dedicated to philosophy, freethought, atheism, rationalism, and Amazigh intellectual culture.',
          communityDescription: 'A space for Moroccan atheists, Amazigh philosophers, freethinkers, and rationalists to share ideas and engage in meaningful discourse.',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout
      title="About"
      description="Learn about Wisdom Circle – Malahida, a community dedicated to philosophy, freethought, and Amazigh intellectual culture."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
          About Wisdom Circle – Malahida
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {settings?.aboutText || 'Wisdom Circle – Malahida is a community dedicated to philosophy, freethought, atheism, rationalism, and Amazigh intellectual culture.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Community</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {settings?.communityDescription || 'A space for Moroccan atheists, Amazigh philosophers, freethinkers, and rationalists to share ideas and engage in meaningful discourse.'}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Wisdom Circle – Malahida aims to foster intellectual discourse, critical thinking, and cultural exchange within the Amazigh community and beyond. We provide a platform for sharing philosophical insights, challenging ideas, and promoting rational thought.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What We Do</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Publish articles on philosophy, freethought, and rationalism</li>
                <li>Host podcasts and video discussions (HEDRA)</li>
                <li>Create a space for intellectual exchange</li>
                <li>Promote Amazigh intellectual culture</li>
                <li>Support critical thinking and evidence-based discourse</li>
              </ul>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-8">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "The unexamined life is not worth living." – Socrates
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

