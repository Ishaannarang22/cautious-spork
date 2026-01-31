import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Home, Baby, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationCardsProps {
  onComplete: (answers: { drives: boolean; owns: boolean; hasChildren: boolean }) => void;
}

interface QuestionCard {
  id: string;
  icon: React.ElementType;
  question: string;
  yesText: string;
  noText: string;
}

const questions: QuestionCard[] = [
  {
    id: "drives",
    icon: Car,
    question: "Do you drive in the city?",
    yesText: "Yes",
    noText: "No",
  },
  {
    id: "owns",
    icon: Home,
    question: "Do you rent or own?",
    yesText: "Own",
    noText: "Rent",
  },
  {
    id: "hasChildren",
    icon: Baby,
    question: "Do you have children in SFUSD?",
    yesText: "Yes",
    noText: "No",
  },
];

export const VerificationCards = ({ onComplete }: VerificationCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isExiting, setIsExiting] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const currentQuestion = questions[currentIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsExiting(false);
      }, 300);
    } else {
      // All questions answered
      setTimeout(() => {
        onComplete({
          drives: newAnswers.drives ?? false,
          owns: newAnswers.owns ?? false,
          hasChildren: newAnswers.hasChildren ?? false,
        });
      }, 500);
    }
  };

  const currentQuestion = questions[currentIndex];
  const Icon = currentQuestion.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_60%_/_0.08)_0%,_transparent_50%)]" />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Verify Your Profile
          </h2>
          <p className="text-muted-foreground">
            Help us personalize your civic impact score
          </p>
        </motion.div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index < currentIndex
                  ? "w-8 bg-accent"
                  : index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-4 bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="card-elevated p-8 rounded-2xl"
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                {/* Question */}
                <h3 className="text-xl font-semibold text-foreground mb-8">
                  {currentQuestion.question}
                </h3>

                {/* Buttons */}
                <div className="flex gap-4 w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-base"
                    onClick={() => handleAnswer(false)}
                  >
                    {currentQuestion.noText}
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1 h-14 text-base"
                    onClick={() => handleAnswer(true)}
                  >
                    {currentQuestion.yesText}
                    <Check className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onComplete({ drives: false, owns: false, hasChildren: false })}
        >
          Skip verification
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
