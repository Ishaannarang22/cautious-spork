import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap } from "lucide-react";

interface HeroSectionProps {
  onAnalyze: (email: string, linkedin: string) => void;
}

export const HeroSection = ({ onAnalyze }: HeroSectionProps) => {
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && linkedin) {
      onAnalyze(email, linkedin);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(217_91%_60%_/_0.08)_0%,_transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm text-muted-foreground mb-8"
        >
          <Shield className="w-4 h-4 text-primary" />
          <span>Your data, your power</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          <span className="text-foreground">Democracy is decided by</span>
          <br />
          <span className="text-foreground">those who </span>
          <span className="text-gradient">show up.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12 font-light"
        >
          We tell you where to show up.
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-md mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-secondary/50 border-border/50 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
              required
            />
            <Input
              type="url"
              placeholder="LinkedIn Profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="flex-1 h-12 bg-secondary/50 border-border/50 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-primary/20"
              required
            />
          </div>
          
          <Button type="submit" variant="hero" size="xl" className="w-full group">
            <Zap className="w-5 h-5" />
            Analyze what I should care about
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.form>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Privacy-first</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Non-partisan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Your data, your control</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
