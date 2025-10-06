import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const questions = [
  {
    id: 1,
    question: "Are you more competitive or reflective?",
    options: ["Competitive", "Reflective"],
  },
  {
    id: 2,
    question: "Do you prefer bold or calm approaches?",
    options: ["Bold", "Calm"],
  },
  {
    id: 3,
    question: "What motivates you more?",
    options: ["Health", "Connection"],
  },
  {
    id: 4,
    question: "How do you prefer communication?",
    options: ["Humor", "Seriousness"],
  },
  {
    id: 5,
    question: "Are you a planner or spontaneous?",
    options: ["Planner", "Spontaneous"],
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save personality profile to localStorage
      localStorage.setItem("personalityProfile", JSON.stringify(newAnswers));
      navigate("/dashboard");
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-center text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </motion.div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="card-elevated p-8">
            <h2 className="text-heading mb-8 text-center">
              {questions[currentQuestion].question}
            </h2>
            
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full py-6 text-lg font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  variant="outline"
                >
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
