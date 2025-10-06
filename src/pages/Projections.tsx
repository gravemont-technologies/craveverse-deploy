import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Heart, DollarSign, Sparkles } from "lucide-react";
import MuscularMan from "@/components/MuscularMan";

const Projections = () => {
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const craving = localStorage.getItem("currentCraving") || "Sugar";
  const musclePct = parseFloat(localStorage.getItem("musclePct") || "0");
  
  // Mock projection data based on streak
  const projections = [
    {
      icon: Heart,
      title: "Lifespan Impact",
      current: (streak * 0.05).toFixed(1),
      projected: ((streak + 30) * 0.05).toFixed(1),
      unit: "years",
      color: "text-destructive",
    },
    {
      icon: DollarSign,
      title: "Financial Savings",
      current: (streak * 10).toFixed(0),
      projected: ((streak + 30) * 10).toFixed(0),
      unit: "USD",
      color: "text-accent",
    },
    {
      icon: Sparkles,
      title: "Fulfillment Score",
      current: Math.min(streak * 2, 100).toFixed(0),
      projected: Math.min((streak + 30) * 2, 100).toFixed(0),
      unit: "%",
      color: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-display mb-2">Your Future</h1>
          <p className="text-muted-foreground">See data-backed projections of your transformation. Check in daily to watch your future self evolve!</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {projections.map((projection, index) => (
            <motion.div
              key={projection.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-elevated">
                <projection.icon className={`w-8 h-8 ${projection.color} mb-4`} />
                <h3 className="font-bold mb-2">{projection.title}</h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">
                      {projection.current} <span className="text-sm">{projection.unit}</span>
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">30 Days</p>
                    <p className={`text-2xl font-bold ${projection.color}`}>
                      {projection.projected} <span className="text-sm">{projection.unit}</span>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress Graph */}
        <Card className="card-elevated">
          <h2 className="text-heading mb-6">Progress Timeline</h2>
          
          <div className="relative h-64">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={`${y}%`}
                  x2="100%"
                  y2={`${y}%`}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}
              
              {/* Progress line */}
              <motion.polyline
                points={`0,100 ${streak * 2},${100 - streak * 2} ${(streak + 30) * 2},${100 - (streak + 30) * 2}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Data points */}
              <motion.circle
                cx={`${streak * 2}%`}
                cy={`${100 - streak * 2}%`}
                r="6"
                fill="hsl(var(--primary))"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              />
            </svg>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <span>Start</span>
            <span>Current ({streak} days)</span>
            <span>+30 days</span>
          </div>
        </Card>

        {/* Future Vision Panel */}
        <Card className="card-elevated mt-8">
          <h2 className="text-heading mb-6">Your Future Self</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <MuscularMan progress={musclePct} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-2xl font-bold text-primary mb-2">
                  {craving === "Sugar" && `+${(streak * 0.05).toFixed(1)} years gained`}
                  {craving === "Smoking" && `+${(streak * 0.1).toFixed(1)} years gained`}
                  {craving === "Procrastination" && `$${streak * 500} saved`}
                  {craving === "Shopping" && `$${streak * 500} saved`}
                  {craving === "NoFap" && "Enhanced fulfillment unlocked"}
                </p>
                <p className="text-sm text-muted-foreground">Your current progress</p>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-lg font-bold text-destructive mb-2">
                  {craving === "Sugar" && `-${(streak * 0.05 * 0.5).toFixed(1)} years if you stop now`}
                  {craving === "Smoking" && `-${(streak * 0.1 * 0.5).toFixed(1)} years if you stop now`}
                  {craving === "Procrastination" && `-$${streak * 250} if you stop now`}
                  {craving === "Shopping" && `-$${streak * 250} if you stop now`}
                  {craving === "NoFap" && "Potential setback if you stop now"}
                </p>
                <p className="text-sm text-muted-foreground">Reminder: Keep going!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Projections;
