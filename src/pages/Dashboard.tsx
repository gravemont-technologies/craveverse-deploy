import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic, Coins, Calendar, Share2, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MuscularMan from "@/components/MuscularMan";
import BadgeDisplay from "@/components/BadgeDisplay";
import SylviaChat from "@/components/SylviaChat";

const cravings = ["Sugar", "NoFap", "Smoking", "Procrastination", "Shopping"];

const Dashboard = () => {
  const [selectedCraving, setSelectedCraving] = useState(localStorage.getItem("currentCraving") || "Sugar");
  const [streak, setStreak] = useState(parseInt(localStorage.getItem("streak") || "0"));
  const [coins, setCoins] = useState(parseInt(localStorage.getItem("coins") || "0"));
  const [stress, setStress] = useState([parseInt(localStorage.getItem("stress") || "5")]);
  const [toughness, setToughness] = useState([parseInt(localStorage.getItem("toughness") || "1")]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [musclePct, setMusclePct] = useState(parseFloat(localStorage.getItem("musclePct") || "0"));
  const { toast } = useToast();
  const navigate = useNavigate();

  const personality = JSON.parse(localStorage.getItem("personalityProfile") || "[]");
  const isHumorous = personality[3] === "Humor";

  useEffect(() => {
    localStorage.setItem("currentCraving", selectedCraving);
    localStorage.setItem("streak", streak.toString());
    localStorage.setItem("coins", coins.toString());
    localStorage.setItem("stress", stress[0].toString());
    localStorage.setItem("toughness", toughness[0].toString());
    localStorage.setItem("musclePct", musclePct.toString());
  }, [selectedCraving, streak, coins, stress, toughness, musclePct]);

  const toughnessMultiplier = toughness[0] === 3 ? 2 : toughness[0] === 2 ? 1.5 : 1;
  const impactScore = Math.min(streak * 2, 100);

  const handleResist = () => {
    const newStreak = streak + 1;
    const coinReward = Math.floor(10 * toughnessMultiplier);
    const newCoins = coins + coinReward;
    const newMusclePct = Math.min(musclePct + 0.02, 1);
    
    setStreak(newStreak);
    setCoins(newCoins);
    setMusclePct(newMusclePct);
    
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    const message = isHumorous 
      ? "Slayed that urge! 😎" 
      : "Keep conquering, Guardian!";

    toast({
      title: message,
      description: `Streak: ${newStreak} days | +${coinReward} coins`,
    });

    if (newMusclePct > 0.5) {
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

  const shareAchievement = async () => {
    const shareUrl = `${window.location.origin}?share=achievement&craving=${encodeURIComponent(selectedCraving)}&days=${streak}`;
    const message = `I beat ${streak} days of ${selectedCraving}! Join me on CraveVerse to conquer your cravings.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "CraveVerse Achievement",
          text: message,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(`${message} ${shareUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share your achievement with friends.",
      });
    }
  };

  // Voice input: Resist / Relapse / Stress N
  const startVoice = () => {
    const SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice not supported", description: "Try Chrome mobile" });
      return;
    }
    const recog = new SpeechRecognition();
    // @ts-ignore
    recog.lang = "en-US";
    // @ts-ignore
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      if (transcript.includes("resist")) {
        handleResist();
        return;
      }
      if (transcript.includes("relapse")) {
        handleRelapse();
        return;
      }
      const stressMatch = transcript.match(/stress\s*(\d+)/);
      if (stressMatch) {
        const value = Math.max(1, Math.min(10, parseInt(stressMatch[1])));
        setStress([value]);
        toast({ title: `Stress set to ${value}` });
      } else {
        toast({ title: "Heard:", description: transcript });
      }
    };
    // @ts-ignore
    recog.start();
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
          className="mb-6"
        >
          <h1 className="text-display mb-2">Your Command Center</h1>
          <p className="text-muted-foreground">Track, resist, and transform your cravings daily. Check in every day to build your streak!</p>
          
          {streak > 0 && (
            <div className="mt-4">
              <BadgeDisplay streak={streak} />
            </div>
          )}
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
                <label className="text-sm font-bold mb-2 block">Toughness: {toughness[0] === 1 ? "Easy" : toughness[0] === 2 ? "Medium" : "Hard"}</label>
                <Slider
                  value={toughness}
                  onValueChange={setToughness}
                  max={3}
                  min={1}
                  step={1}
                  className="mb-4"
                />
                <p className="text-xs text-muted-foreground">Hard mode doubles your coin rewards!</p>
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

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={startVoice}>
                  <Mic className="mr-2" />
                  Voice
                </Button>
                <Button onClick={() => navigate("/tips")} variant="outline" className="flex-1">
                  <Lightbulb className="mr-2" />
                  Tips
                </Button>
              </div>
            </div>
          </Card>

          {/* Stats & Impact */}
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Habit Impact Score</span>
                  <span className="text-2xl font-bold text-primary">{impactScore}/100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${impactScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Higher score = more lifespan, savings & fulfillment gains</p>
              </div>

              <Button onClick={shareAchievement} variant="outline" className="w-full">
                <Share2 className="mr-2" />
                Share Achievement
              </Button>
            </div>
          </Card>

          {/* Reward Visualization */}
          <Card className="card-elevated lg:col-span-2">
            <h3 className="text-heading mb-4">Your Transformation</h3>
            
            <div className="flex items-center justify-center py-8">
              <MuscularMan progress={musclePct} />
            </div>

            <div className="text-center space-y-2 mb-6">
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

            <Button onClick={() => navigate("/projections")} variant="outline" className="w-full">
              <TrendingUp className="mr-2" />
              View Future Projections
            </Button>
          </Card>
        </div>
      </div>
      <SylviaChat />
    </div>
  );
};

export default Dashboard;
