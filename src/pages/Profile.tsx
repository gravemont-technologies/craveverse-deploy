import { motion } from "framer-motion";
import { User, Trophy, Coins, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProfileEditor from "@/components/ProfileEditor";
import BadgeDisplay from "@/components/BadgeDisplay";

const Profile = () => {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const coins = parseInt(localStorage.getItem("coins") || "0");
  const craving = localStorage.getItem("currentCraving") || "None";
  const userName = localStorage.getItem("userName") || "Anonymous";

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your stats</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ProfileEditor />

          <Card className="card-elevated">
            <h3 className="text-heading mb-6">Your Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="text-primary" />
                  <span className="font-bold">Current Goal</span>
                </div>
                <span className="text-lg font-bold">{craving}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="text-primary" />
                  <span className="font-bold">Streak</span>
                </div>
                <span className="text-lg font-bold text-primary">{streak} days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="text-primary" />
                  <span className="font-bold">Coins</span>
                </div>
                <span className="text-lg font-bold text-primary">{coins}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="card-elevated">
          <h3 className="text-heading mb-6">Your Badges</h3>
          {streak > 0 ? (
            <BadgeDisplay streak={streak} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Start your streak to earn badges!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
