import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = { role: "user" | "assistant"; content: string };

const SylviaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Sylvia, your craving strategy coach. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);

    // Simple AI-like responses based on keywords
    setTimeout(() => {
      let response = "I'm here to help! Try describing your craving or stress level.";
      
      if (input.toLowerCase().includes("stress")) {
        response = "Try taking 5 deep breaths. Stress triggers cravings, but you can break the cycle!";
      } else if (input.toLowerCase().includes("craving")) {
        response = "Acknowledge the craving without judgment. It will pass in 10-15 minutes. You've got this! 💪";
      } else if (input.toLowerCase().includes("help")) {
        response = "I'm here for you! What specific challenge are you facing right now?";
      } else if (input.toLowerCase().includes("relapse")) {
        response = "A setback isn't failure—it's data. What triggered it? Let's build a stronger plan together.";
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);

    setInput("");
  };

  return (
    <>
      <motion.button
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="card-elevated h-96 flex flex-col">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">S</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">Sylvia</h3>
                  <p className="text-xs text-muted-foreground">Strategy Coach</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask Sylvia..."
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SylviaChat;
