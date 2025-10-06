import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Tip {
  id: number;
  text: string;
  likes: number;
}

const Tips = () => {
  const [tipText, setTipText] = useState("");
  const [tips, setTips] = useState<Tip[]>([
    { id: 1, text: "When cravings hit, do 10 pushups. Works every time!", likes: 42 },
    { id: 2, text: "Keep your hands busy with a stress ball or fidget spinner", likes: 38 },
    { id: 3, text: "Call a friend instead of giving in. Connection beats cravings.", likes: 35 },
  ]);
  const { toast } = useToast();

  const profanityFilter = (text: string) => {
    const badWords = ["damn", "hell"]; // simplified filter
    return badWords.some(word => text.toLowerCase().includes(word));
  };

  const handlePostTip = () => {
    if (!tipText.trim()) {
      toast({
        title: "Empty tip",
        description: "Please write something helpful",
        variant: "destructive",
      });
      return;
    }

    if (tipText.length > 280) {
      toast({
        title: "Too long",
        description: "Tips must be under 280 characters",
        variant: "destructive",
      });
      return;
    }

    if (profanityFilter(tipText)) {
      toast({
        title: "Inappropriate content",
        description: "Please keep it supportive and clean",
        variant: "destructive",
      });
      return;
    }

    const newTip: Tip = {
      id: Date.now(),
      text: tipText,
      likes: 0,
    };

    setTips([newTip, ...tips]);
    setTipText("");

    toast({
      title: "Tip posted!",
      description: "Your wisdom is now part of the community",
    });
  };

  const handleLike = (id: number) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, likes: tip.likes + 1 } : tip
    ).sort((a, b) => b.likes - a.likes));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Community Tips</h1>
          <p className="text-muted-foreground">Share wisdom, inspire others</p>
        </motion.div>

        {/* Post Tip */}
        <Card className="card-elevated mb-8">
          <Textarea
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="Share a tip that helped you (max 280 chars)..."
            className="input-primary min-h-[100px] mb-4"
            maxLength={280}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {tipText.length}/280
            </span>
            <Button onClick={handlePostTip} className="btn-resist">
              <Send className="mr-2 w-4 h-4" />
              Post Tip
            </Button>
          </div>
        </Card>

        {/* Tips Feed */}
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-elevated hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
                <p className="mb-4">{tip.text}</p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(tip.id)}
                  className="hover:text-primary transition-colors"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {tip.likes}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tips;
