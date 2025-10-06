import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Gift, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Rewards = () => {
  const [coins, setCoins] = useState(parseInt(localStorage.getItem("coins") || "0"));
  const { toast } = useToast();

  const rewards = [
    { name: "1 Skip Day", cost: 50, icon: Star, description: "Skip a day without breaking streak" },
    { name: "Custom Avatar", cost: 100, icon: Gift, description: "Unlock personalized avatar" },
    { name: "Sylvia Premium", cost: 200, icon: Crown, description: "Advanced AI coaching features" },
    { name: "Theme Pack", cost: 150, icon: Star, description: "Exclusive color themes" },
  ];

  const purchaseReward = (reward: typeof rewards[0]) => {
    if (coins >= reward.cost) {
      setCoins(coins - reward.cost);
      localStorage.setItem("coins", (coins - reward.cost).toString());
      
      toast({
        title: `${reward.name} Unlocked! 🎉`,
        description: `You spent ${reward.cost} coins.`,
      });
    } else {
      toast({
        title: "Not enough coins",
        description: `You need ${reward.cost - coins} more coins.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Rewards Shop</h1>
          <p className="text-muted-foreground">Trade your hard-earned coins</p>
        </motion.div>

        <Card className="card-elevated mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-3xl font-bold text-primary">{coins} coins</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {rewards.map((reward, idx) => (
            <motion.div
              key={reward.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="card-elevated">
                <reward.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{reward.cost} coins</span>
                  <Button
                    onClick={() => purchaseReward(reward)}
                    disabled={coins < reward.cost}
                    className="btn-resist"
                  >
                    Purchase
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
