import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useEventLogger } from '../hooks/useEventLogger';

type TipsForumProps = { userId: string };

const PROFANITY = ['damn', 'hell']; // extend as needed

const TipsForum: React.FC<TipsForumProps> = ({ userId }) => {
  const [tips, setTips] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const { logEvent } = useEventLogger(userId);

  useEffect(() => {
    const fetchTips = async () => {
      const { data } = await supabase.from('tips').select('*').order('likes', { ascending: false });
      if (data) setTips(data);
    };
    fetchTips();
  }, []);

  const handleSubmit = async () => {
    if (PROFANITY.some((word) => content.toLowerCase().includes(word))) {
      alert('Please remove profanity.');
      return;
    }
    if (content.length > 280) {
      alert('Tip must be <= 280 characters.');
      return;
    }

    const { data } = await supabase.from('tips').insert({ user_id: userId, content }).select().single();
    if (data) {
      setTips([data, ...tips]);
      setContent('');
      logEvent({ type: 'tip_posted', data: { tipId: data.id } });
    }
  };

  const likeTip = async (tipId: string) => {
    const { data } = await supabase
      .from('tips')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', tipId)
      .select()
      .single();
    if (data) {
      setTips(tips.map((t) => (t.id === tipId ? data : t)));
      logEvent({ type: 'tip_liked', data: { tipId } });
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <textarea
        maxLength={280}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your tip..."
        className="border p-2 rounded-md w-full"
      />
      <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">
        Post Tip
      </button>

      <div className="flex flex-col gap-3 mt-4">
        {tips.map((tip) => (
          <div key={tip.id} className="p-3 border rounded-md flex justify-between items-center">
            <span>{tip.content}</span>
            <div className="flex gap-2 items-center">
              <span>{tip.likes}</span>
              <button
                onClick={() => likeTip(tip.id)}
                className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
              >
                Like
              </button>
              {tip.likes >= 100 && <span className="text-yellow-500 font-bold">🏆 Top Tipster</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TipsForum;
