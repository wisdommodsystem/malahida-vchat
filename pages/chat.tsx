import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [myUsername, setMyUsername] = useState('');

  useEffect(() => {
    axios.get('/api/profile').then((res) => {
      const u = res.data?.data?.username || '';
      setMyUsername(u);
      const load = async () => {
        const res = await axios.get('/api/messages');
        if (res.data?.success) setMessages(res.data.data || []);
      };
      load();
      try {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }
      } catch {}
    }).catch(() => {
      router.replace('/login?next=/chat');
    });
  }, [router]);

  useEffect(() => {
    const channel = supabaseClient
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const row = payload.new as any;
        setMessages((prev) => [...prev, { id: row.id, username: row.username, message: row.message, timestamp: row.timestamp }]);
        setNewCount((c) => c + 1);
        try {
          const isMine = Boolean(myUsername) && row.username === myUsername;
          const isMention = Boolean(myUsername) && typeof row.message === 'string' && row.message.includes(`@${myUsername}`);
          const canNotify = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
          if (canNotify && (!isMine || isMention)) {
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await axios.post('/api/messages', { message: input });
      if (res.data?.success) setInput('');
      setNewCount(0);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout title="Group Chat" description="Public real-time group chat">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow">
          <div className="p-4 h-[480px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Group Chat</h2>
              <div className="relative inline-flex items-center" title="New messages">
                <span className="text-xl">🔔</span>
                {newCount > 0 && (
                  <button onClick={() => setNewCount(0)} className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {newCount}
                  </button>
                )}
              </div>
            </div>
            {messages.map((m) => (
              <div key={m.id} className="mb-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(m.timestamp).toLocaleString()}</div>
                <div className="font-semibold text-gray-900 dark:text-white">{m.username}</div>
                <div className="text-gray-800 dark:text-gray-200">{m.message}</div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Type a message"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            />
            <button onClick={send} disabled={sending} className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600">
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
