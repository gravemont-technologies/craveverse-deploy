import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Emergency = () => {
  const [severity, setSeverity] = useState([5]);
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();

  const craving = localStorage.getItem("currentCraving") || "Sugar";
  const personality = JSON.parse(localStorage.getItem("personalityProfile") || "[]");

  const getRitual = () => {
    const duration = severity[0] > 7 ? 60 : severity[0] > 4 ? 30 : 15;
    
    const rituals: Record<string, string[]> = {
      Sugar: [
        "Take 10 deep breaths",
        "Drink a glass of water",
        "Do 20 jumping jacks",
        "Call a friend",
      ],
      NoFap: [
        "Journal for 5 minutes",
        "Take a cold shower",
        "Go for a walk",
        "Read an inspiring article",
      ],
      Smoking: [
        "Chew gum",
        "Practice box breathing",
        "Stretch for 5 minutes",
        "Text your accountability partner",
      ],
      Procrastination: [
        "Write down 3 small tasks",
        "Set a 5-minute timer",
        "Clear your workspace",
        "Break goal into micro-steps",
      ],
      Shopping: [
        "Wait 24 hours rule",
        "Check your budget",
        "List 3 things you already own",
        "Unsubscribe from marketing emails",
      ],
    };

    return { steps: rituals[craving] || rituals.Sugar, duration };
  };

  const startRitual = () => {
    setIsRitualActive(true);
    const { duration } = getRitual();
    setTimer(duration);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRitualActive(false);
          toast({
            title: "Ritual Complete! 🎉",
            description: "You survived the urge. You're stronger than you think!",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const shareProgress = async () => {
    const streak = parseInt(localStorage.getItem("streak") || "0");
    const message = `I've committed ${streak} days to conquering ${craving} and I need support! Join me on CraveVerse.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "CraveVerse Emergency",
          text: message,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Copied to clipboard!",
        description: "Share this message with your support network.",
      });
    }
  };

  const { steps, duration } = getRitual();

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2 text-destructive">Emergency SOS</h1>
          <p className="text-muted-foreground">Immediate help when cravings strike</p>
        </motion.div>

        <Card className="card-elevated bg-destructive/10 mb-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-bold text-lg">You're in a tough spot</h3>
                <p className="text-sm text-muted-foreground">
                  Rate your urge intensity to get personalized help
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">
                Urge Severity: {severity[0]}/10
              </label>
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="mb-4"
              />
            </div>

            {!isRitualActive && (
              <Button
                onClick={startRitual}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-14 text-lg"
              >
                Start Emergency Ritual ({duration}s)
              </Button>
            )}
          </div>
        </Card>

        {isRitualActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="card-elevated mb-6 text-center">
              <div className="space-y-4">
                <div className="text-6xl font-bold text-primary">{timer}s</div>
                <p className="text-muted-foreground">Stay with it... you've got this</p>
              </div>
            </Card>
          </motion.div>
        )}

        <Card className="card-elevated mb-6">
          <h3 className="text-heading mb-4">Your Ritual Steps</h3>
          <ul className="space-y-3">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Button
          onClick={shareProgress}
          variant="outline"
          className="w-full"
        >
          <Share2 className="mr-2" />
          Ask for Support
        </Button>
      </div>
    </div>
  );
};

export default Emergency;
