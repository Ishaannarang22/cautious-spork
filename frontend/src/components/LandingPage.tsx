import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, FileText, Send, Shield, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const LandingPage: React.FC = () => {
  const { setAppState, setUserInfo } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setUserInfo({ name, email, company: company || undefined });
    setAppState('userDiscovery');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6" />
              <span className="text-lg font-medium tracking-tight">LitiGate</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                For Law Firms
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start py-20">
          {/* Left - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                California Consumer Rights
              </div>

              <h1 className="text-5xl md:text-6xl font-medium tracking-tight leading-[1.1]">
                Enforce your
                <br />
                consumer rights
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Automated infrastructure for identifying potential compensation eligibility and generating compliant legal documents.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 py-8 border-y border-border">
              <div>
                <div className="text-3xl font-medium tracking-tight">$40B</div>
                <div className="text-sm text-muted-foreground mt-1">Class action settlements in 2024</div>
              </div>
              <div>
                <div className="text-3xl font-medium tracking-tight">268%</div>
                <div className="text-sm text-muted-foreground mt-1">YoY increase in TCPA claims</div>
              </div>
              <div>
                <div className="text-3xl font-medium tracking-tight">1.29M</div>
                <div className="text-sm text-muted-foreground mt-1">CFPB complaints Q1 2025</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Shield, text: 'Identify statutory compensation eligibility' },
                { icon: FileText, text: 'Generate compliant pre-action letters' },
                { icon: Send, text: 'Route documents to correct counterparty' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-medium mb-2">Get started</h2>
                <p className="text-muted-foreground">Enter your details to begin the eligibility scan</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Company <span className="opacity-50">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input-field"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-4 py-4 px-6 rounded-full bg-foreground text-background font-medium flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                >
                  Start Eligibility Scan
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-6">
                This system provides legal information, not legal advice. Results indicate potential eligibility only.
              </p>
            </div>
          </motion.div>
        </div>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 border-t border-border">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-medium mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our automated system identifies potential violations and generates compliant documents for enforcement.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Research',
                description: 'We scan for companies that have accessed your data, from utilities to spam callers.',
              },
              {
                step: '02',
                title: 'Analysis',
                description: 'Our system identifies potential statutory violations and compensation eligibility.',
              },
              {
                step: '03',
                title: 'Document Generation',
                description: 'Compliant pre-action letters and complaint documents are automatically generated.',
              },
              {
                step: '04',
                title: 'Dispatch',
                description: 'Documents are routed to the correct counterparty with your approval.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-5xl font-light text-primary mb-4">{item.step}</div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 border-t border-border">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>CCPA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Auditable Decision Paths</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>User Approval Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>California Jurisdiction</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-medium">LitiGate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Legal information automation. Not legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
