import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Trophy, Users, TrendingUp, MessageCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Target, title: "Dashboard", description: "Track cravings daily. Resist/relapse buttons, stress slider, earn coins & badges every 7 days!" },
    { icon: Trophy, title: "Personality Quiz", description: "5 questions shape your experience. Get humor-based or serious nudges!" },
    { icon: Users, title: "Teams", description: "Create/join challenges with friends. Upload photo proof to stay accountable!" },
    { icon: TrendingUp, title: "Projections", description: "See your future self: lifespan gains, savings. Check daily for motivation!" },
    { icon: MessageCircle, title: "Tips Forum", description: "Share & discover strategies from the community. Like-sorted wisdom!" },
    { icon: BarChart3, title: "Emergency SOS", description: "Instant help when cravings strike. Tailored rituals based on severity!" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.h1
            className="text-hero mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            Overcome your worst, engineer your best
          </motion.h1>
          
          <motion.p
            className="text-2xl mb-12 text-foreground/80 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            CraveVerse: AI-powered craving conquest with gamified rewards and community insights
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/quiz")}
              className="btn-hero group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Map Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-display text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Your Transformation Journey
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-elevated hover:shadow-[var(--shadow-glow)] transition-shadow duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-heading mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary/20 to-secondary/20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-display mb-6">Ready to conquer your cravings?</h2>
          <p className="text-xl mb-8 text-foreground/80">
            Join thousands transforming their lives with AI-powered support
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/quiz")}
            className="btn-hero"
          >
            Begin Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
