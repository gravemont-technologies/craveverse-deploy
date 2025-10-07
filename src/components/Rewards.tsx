// src/components/Rewards.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "../hooks/use-toast"; // your existing toast hook
import { useEventLogger } from "../hooks/useEventLogger";

type RewardsProps = {
  userId: string;
  habitType?: string;
};

const Rewards: React.FC<RewardsProps> = ({ userId, habitType = "general" }) => {
  const [coins, setCoins] = useState<number>(parseInt(localStorage.getItem("coins") || "0"));
  const { logEvent } = useEventLogger(userId);

  const rewards = [
    { name: "1 Skip Day", cost: 50, key: "skip_day" },
    { name: "Custom Avatar", cost: 100, key: "avatar" },
    { name: "Premium Coaching", cost: 200, key: "premium" }
  ];

  const refreshLocalCoins = async () => {
    // optional: fetch coins from habits table aggregated
    const { data } = await supabase.from("habits").select("coins").eq("user_id", userId);
    if (data) {
      const total = data.reduce((s: number, r: any) => s + (r.coins || 0), 0);
      setCoins(total);
      localStorage.setItem("coins", total.toString());
    }
  };

  const purchaseReward = async (reward: typeof rewards[0]) => {
    try {
      // verify balance
      if (coins < reward.cost) {
        toast({ title: "Not enough coins", description: `You need ${reward.cost - coins} more coins.`, variant: "destructive" });
        return;
      }

      // create coin transaction
      await supabase.from("coin_transactions").insert({
        user_id: userId,
        habit_id: null,
        type: "spend",
        amount: reward.cost,
        reason: `purchase:${reward.key}`,
        created_at: new Date().toISOString()
      });

      // deduct coins from a default habit row (if exists) - pick first user's habit
      const { data: habits } = await supabase.from("habits").select("*").eq("user_id", userId).limit(1);
      if (habits && habits.length) {
        const h = habits[0];
        await supabase.from("habits").update({ coins: supabase.raw("GREATEST(coins - ?,0)", [reward.cost]) }).eq("id", h.id);
      } else {
        // no habit rows — store coins in localStorage fallback
        setCoins((c) => {
          const newC = Math.max(0, c - reward.cost);
          localStorage.setItem("coins", newC.toString());
          return newC;
        });
      }

      toast({ title: `${reward.name} Unlocked! 🎉`, description: `You spent ${reward.cost} coins.` });
      logEvent({ type: "reward_purchased", data: { reward: reward.key, cost: reward.cost } });
      // refresh local coins state
      refreshLocalCoins();
    } catch (err) {
      console.error("purchaseReward error", err);
      toast({ title: "Purchase failed", description: "Check console for errors", variant: "destructive" });
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Your Balance</div>
        <div className="text-2xl font-bold">{coins} coins</div>
      </div>

      <div className="grid gap-3">
        {rewards.map((r) => (
          <div key={r.key} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-muted-foreground">{r.cost} coins</div>
            </div>
            <button onClick={() => purchaseReward(r)} className="bg-primary text-white px-3 py-1 rounded">
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;

