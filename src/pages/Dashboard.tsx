import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic, Trophy, Coins, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cravings = ["Sugar", "NoFap", "Smoking", "Procrastination", "Shopping"];

const Dashboard = () => {
  const [selectedCraving, setSelectedCraving] = useState("Sugar");
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [stress, setStress] = useState([5]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [musclePct, setMusclePct] = useState(0);
  const { toast } = useToast();

  const personality = JSON.parse(localStorage.getItem("personalityProfile") || "[]");
  const isHumorous = personality[3] === "Humor";

  const handleResist = () => {
    setStreak(streak + 1);
    setCoins(coins + 10);
    setMusclePct(Math.min(musclePct + 0.02, 1));
    
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    const message = isHumorous 
      ? "Slayed that urge! 😎" 
      : "Keep conquering, Guardian!";

    toast({
      title: message,
      description: `Streak: ${streak + 1} days | +10 coins`,
    });

    if (musclePct + 0.02 > 0.5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleRelapse = () => {
    setStreak(0);
    setMusclePct(0);
    
    toast({
      title: "Tomorrow's a new quest!",
      description: "Every journey has its bumps. Keep going!",
      variant: "destructive",
    });
  };

  const cardBgColor = stress[0] > 7 
    ? "bg-secondary/20" 
    : streak > 5 
    ? "bg-primary/20" 
    : streak === 0 
    ? "bg-muted/50" 
    : "bg-card";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Your Command Center</h1>
          <p className="text-muted-foreground">Track, resist, and transform</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Craving Selector & Actions */}
          <Card className={`card-elevated ${cardBgColor} transition-colors duration-500`}>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold mb-2 block">Select Craving</label>
                <Select value={selectedCraving} onValueChange={setSelectedCraving}>
                  <SelectTrigger className="input-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cravings.map((craving) => (
                      <SelectItem key={craving} value={craving}>
                        {craving}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Stress Level: {stress[0]}/10</label>
                <Slider
                  value={stress}
                  onValueChange={setStress}
                  max={10}
                  min={1}
                  step={1}
                  className="mb-4"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleResist}
                  className="btn-resist flex-1"
                >
                  Resist
                </Button>
                <Button
                  onClick={handleRelapse}
                  className="btn-relapse flex-1"
                >
                  Relapse
                </Button>
              </div>

              <Button variant="outline" className="w-full">
                <Mic className="mr-2" />
                Voice Input
              </Button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="card-elevated">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary" />
                  <span className="font-bold">Streak</span>
                </div>
                <span className="text-3xl font-bold text-primary">{streak} days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="text-primary" />
                  <span className="font-bold">Coins</span>
                </div>
                <span className="text-3xl font-bold text-primary">{coins}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">50 coins = 1 skip day</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(coins % 50) * 2}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Reward Visualization */}
          <Card className="card-elevated lg:col-span-2">
            <h3 className="text-heading mb-4">Your Transformation</h3>
            
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  filter: musclePct > 0.5 ? "drop-shadow(0 0 20px rgba(255, 204, 153, 0.8))" : "none",
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill={musclePct > 0.3 ? "#ffcc99" : "#666"}
                    opacity={0.2 + musclePct * 0.8}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="60"
                    fill={musclePct > 0.5 ? "#ffcc99" : "#888"}
                    opacity={0.3 + musclePct * 0.7}
                  />
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="24"
                    fontWeight="bold"
                  >
                    {Math.round(musclePct * 100)}%
                  </text>
                </svg>
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-bold">
                {selectedCraving === "Sugar" && `Lifespan: +${(streak * 0.05).toFixed(1)} years`}
                {selectedCraving === "Smoking" && `Lifespan: +${(streak * 0.1).toFixed(1)} years`}
                {selectedCraving === "Procrastination" && `Savings: +$${streak * 500}`}
                {selectedCraving === "Shopping" && `Savings: +$${streak * 500}`}
                {selectedCraving === "NoFap" && "Soulmate AI Chat Unlocked"}
              </p>
              <p className="text-sm text-muted-foreground">
                Based on {selectedCraving === "Sugar" || selectedCraving === "Smoking" ? "NIH/CDC" : "Monte Carlo"} data
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
