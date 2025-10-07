// src/components/TipsForum.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useEventLogger } from "../hooks/useEventLogger";

type TipsForumProps = { userId: string };

const PROFANITY = ["damn", "hell"]; // extend carefully server-side too

const TipsForum: React.FC<TipsForumProps> = ({ userId }) => {
  const [tips, setTips] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const { logEvent } = useEventLogger(userId);

  const fetchTips = async () => {
    const { data } = await supabase.from("tips").select("*").order("likes", { ascending: false }).limit(200);
    if (data) setTips(data);
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleSubmit = async () => {
    if (PROFANITY.some((word) => content.toLowerCase().includes(word))) {
      alert("Please remove profanity.");
      return;
    }
    if (!content.trim()) return;
    if (content.length > 280) {
      alert("Tip must be <= 280 characters.");
      return;
    }

    const { data, error } = await supabase.from("tips").insert({ user_id: userId, content }).select().single();
    if (error) {
      console.error("post tip error", error);
      alert("Failed to post tip");
      return;
    }
    setTips((prev) => [data, ...prev]);
    setContent("");
    logEvent({ type: "tip_posted", data: { tipId: data.id } });
  };

  const likeTip = async (tipId: string) => {
    try {
      // prevent double-like
      const { data: existing } = await supabase.from("tip_likes").select("*").eq("tip_id", tipId).eq("user_id", userId).single();
      if (existing) {
        // already liked
        return;
      }

      // insert like
      const { error: likeErr } = await supabase.from("tip_likes").insert({ tip_id: tipId, user_id: userId });
      if (likeErr) throw likeErr;

      // increment likes safely
      const { data: updated } = await supabase
        .from("tips")
        .update({ likes: supabase.raw("likes + 1") })
        .eq("id", tipId)
        .select()
        .single();

      if (updated) {
        setTips((prev) => prev.map((t) => (t.id === tipId ? updated : t)));
        logEvent({ type: "tip_liked", data: { tipId } });

        // award Top Tipster badge when likes >= 100
        if (updated.likes >= 100) {
          // ensure badge exists
          const { data: badge } = await supabase.from("badges").select("*").eq("key", "top_tipster").limit(1).single();
          let badgeId = badge?.id;
          if (!badgeId) {
            const { data: createdBadge } = await supabase.from("badges").insert({
              key: "top_tipster",
              name: "Top Tipster",
              description: "100+ likes on a tip",
              criteria: { likes: 100 }
            }).select().single();
            badgeId = createdBadge.id;
          }

          // award user (if not already)
          const { data: existingAward } = await supabase.from("user_badges").select("*").eq("user_id", userId).eq("badge_id", badgeId).single();
          if (!existingAward) {
            await supabase.from("user_badges").insert({ user_id: userId, badge_id: badgeId });
          }
        }
      }
    } catch (err) {
      console.error("like error", err);
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
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded-md">
          Post Tip
        </button>
        <span className="text-sm text-muted-foreground self-center">{content.length}/280</span>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {tips.map((tip) => (
          <div key={tip.id} className="p-3 border rounded-md flex justify-between items-center">
            <span>{tip.content}</span>
            <div className="flex gap-2 items-center">
              <span>{tip.likes ?? 0}</span>
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

