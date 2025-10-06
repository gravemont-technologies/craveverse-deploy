import { Trophy, Award, Star, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface BadgeDisplayProps {
  streak: number;
}

const BadgeDisplay = ({ streak }: BadgeDisplayProps) => {
  const badges = [
    { days: 7, icon: Trophy, name: "Week Warrior", color: "text-primary" },
    { days: 14, icon: Award, name: "Fortnight Fighter", color: "text-secondary" },
    { days: 21, icon: Star, name: "Triple Week Titan", color: "text-accent" },
    { days: 30, icon: Crown, name: "Month Master", color: "text-primary" },
    { days: 60, icon: Zap, name: "Double Month Legend", color: "text-destructive" },
  ];

  const earnedBadges = badges.filter(badge => streak >= badge.days);

  if (earnedBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {earnedBadges.map((badge, idx) => (
        <motion.div
          key={badge.days}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border ${badge.color}`}
        >
          <badge.icon className="w-4 h-4" />
          <span className="text-xs font-bold">{badge.name}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
