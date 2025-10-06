import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SylviaChat from "@/components/SylviaChat";

interface Tip {
  id: number;
  text: string;
  likes: number;
  author: string;
  authorInitial: string;
}

const Tips = () => {
  const [tipText, setTipText] = useState("");
  const [userName, setUserName] = useState("");
  const [tips, setTips] = useState<Tip[]>([
    { id: 1, text: "When cravings hit, do 10 pushups. Works every time!", likes: 42, author: "Alex", authorInitial: "A" },
    { id: 2, text: "Keep your hands busy with a stress ball or fidget spinner", likes: 38, author: "Jordan", authorInitial: "J" },
    { id: 3, text: "Call a friend instead of giving in. Connection beats cravings.", likes: 35, author: "Sam", authorInitial: "S" },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "Anonymous";
    setUserName(storedName);
  }, []);

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
      author: userName,
      authorInitial: userName.charAt(0).toUpperCase(),
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
          <p className="text-muted-foreground">Share strategies and inspire others. Browse daily for fresh insights!</p>
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
                <div className="flex items-start gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {tip.authorInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-sm mb-1">{tip.author}</p>
                    <p>{tip.text}</p>
                  </div>
                </div>
                
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
      <SylviaChat />
    </div>
  );
};

export default Tips;
