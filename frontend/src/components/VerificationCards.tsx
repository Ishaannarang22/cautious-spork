import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MapPin, Phone, ShoppingBag, Car, Briefcase, Check, X, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { verificationQuestions } from '@/data/sampleClaims';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  MapPin,
  Phone,
  ShoppingBag,
  Car,
  Briefcase,
};

const VerificationCards: React.FC = () => {
  const { setAppState, updateVerificationAnswer } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleAnswer = (answer: boolean) => {
    const answerKeys = [
      'dataBreachNotifications',
      'californiaResident',
      'spamCalls',
      'retailerAccounts',
      'vehicleOwner',
      'californiaEmployer',
    ] as const;
    
    updateVerificationAnswer(answerKeys[currentQuestion], answer);
    
    if (currentQuestion < verificationQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion(prev => prev + 1);
    } else {
      setAppState('dashboard');
    }
  };

  const handleSkip = () => {
    if (currentQuestion < verificationQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion(prev => prev + 1);
    } else {
      setAppState('dashboard');
    }
  };

  const question = verificationQuestions[currentQuestion];
  const IconComponent = iconMap[question.icon] || Shield;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {verificationQuestions.map((_, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              scale: index === currentQuestion ? 1.2 : 1,
              backgroundColor: index <= currentQuestion 
                ? 'hsl(var(--primary))' 
                : 'hsl(var(--secondary))',
            }}
            className="w-2.5 h-2.5 rounded-full"
          />
        ))}
      </div>

      {/* Question card */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="card-elevated p-8 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 mb-6"
            >
              <IconComponent className="w-8 h-8 text-primary" />
            </motion.div>

            {/* Question */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-semibold text-foreground mb-8"
            >
              {question.question}
            </motion.h2>

            {/* Answer buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(true)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent/20 border border-accent/30 text-accent font-medium hover:bg-accent/30 transition-colors"
              >
                <Check className="w-5 h-5" />
                Yes
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(false)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-secondary border border-border text-muted-foreground font-medium hover:bg-secondary/70 transition-colors"
              >
                <X className="w-5 h-5" />
                No
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={handleSkip}
        className="flex items-center gap-1 mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Skip this question
        <ChevronRight className="w-4 h-4" />
      </motion.button>

      {/* Question counter */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        Question {currentQuestion + 1} of {verificationQuestions.length}
      </motion.p>
    </div>
  );
};

export default VerificationCards;
