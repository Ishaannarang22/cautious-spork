import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, User, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';

const industries = [
  'Technology',
  'Healthcare',
  'Retail',
  'Finance',
  'Manufacturing',
  'Food & Beverage',
  'Professional Services',
  'Construction',
  'Other'
];

const LandingPage: React.FC = () => {
  const { setAppState, setUser } = useApp();
  const [activeTab, setActiveTab] = useState('individual');
  
  // Individual form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  
  // Business form state
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [industry, setIndustry] = useState('');

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setUser({
      type: 'individual',
      name,
      email,
      phone: phone || undefined,
      linkedIn: linkedIn || undefined,
      eligibilityScore: 87,
      activeJurisdictions: ['California'],
      claimsAccepted: [],
      claimsSkipped: [],
    });
    setAppState('scanning');
  };

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !websiteUrl || !ownerName || !businessEmail) return;
    
    setUser({
      type: 'individual',
      name: ownerName,
      email: businessEmail,
      eligibilityScore: 82,
      activeJurisdictions: ['California'],
      claimsAccepted: [],
      claimsSkipped: [],
    });
    setAppState('scanning');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-yellow-500 mb-6 shadow-glow"
          >
            <Scale className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Legal Claims Discovery
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-muted-foreground"
          >
            Find money you're owed. Zero effort.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card-elevated p-6 md:p-8"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger 
                value="business"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Small Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual">
              <form onSubmit={handleIndividualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-muted-foreground">LinkedIn URL (optional)</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="linkedin.com/in/johndoe"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3.5 px-6 rounded-xl btn-primary-glow flex items-center justify-center gap-2 font-semibold text-base transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  Discover My Claims
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>
            </TabsContent>

            <TabsContent value="business">
              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-foreground">Business Name *</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Acme Corp"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-foreground">Business Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://acmecorp.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-foreground">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    type="text"
                    placeholder="Jane Smith"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail" className="text-foreground">Email Address *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="jane@acmecorp.com"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-muted-foreground">Industry (optional)</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-secondary/50 border-border focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind.toLowerCase()} className="focus:bg-secondary">
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3.5 px-6 rounded-xl btn-primary-glow flex items-center justify-center gap-2 font-semibold text-base transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  Discover Business Claims
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Your data is encrypted and never shared. We only use it to find your claims.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
