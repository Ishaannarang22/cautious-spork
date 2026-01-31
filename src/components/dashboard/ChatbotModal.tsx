import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => void;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your Fulcrum AI assistant. I noticed some things about your civic profile. What did we get wrong?",
  },
];

export const ChatbotModal = ({ isOpen, onClose, onUpdateProfile }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let response = "";
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes("bought") || lowerMessage.includes("own") || lowerMessage.includes("house")) {
        response = "Got it! I'm updating your housing status to Owner. This will affect which housing policies we highlight for you—expect to see more property tax and zoning regulations in your feed.";
        onUpdateProfile({ owns: true });
      } else if (lowerMessage.includes("rent")) {
        response = "Understood. Keeping your status as Renter. You'll continue to see rent control and tenant rights updates.";
        onUpdateProfile({ owns: false });
      } else if (lowerMessage.includes("kid") || lowerMessage.includes("child") || lowerMessage.includes("school")) {
        if (lowerMessage.includes("no") || lowerMessage.includes("don't") || lowerMessage.includes("not")) {
          response = "No problem! I've removed SFUSD-related items from your priority feed.";
          onUpdateProfile({ hasChildren: false });
        } else {
          response = "Great! I'll add school board and SFUSD budget items to your priority feed. Education policy will now be weighted higher in your recommendations.";
          onUpdateProfile({ hasChildren: true });
        }
      } else if (lowerMessage.includes("drive") || lowerMessage.includes("car")) {
        if (lowerMessage.includes("no") || lowerMessage.includes("don't") || lowerMessage.includes("not")) {
          response = "Noted! I've removed parking and vehicle-related policies from your priority list.";
          onUpdateProfile({ drives: false });
        } else {
          response = "Thanks for confirming! Parking meters and vehicle-related policies will remain in your feed.";
          onUpdateProfile({ drives: true });
        }
      } else {
        response = "I understand. Could you tell me more specifically what we got wrong? For example: 'I actually own my home now' or 'I don't have kids in SFUSD.'";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    simulateResponse(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed right-6 bottom-6 z-50 w-full max-w-md"
          >
            <div className="card-elevated rounded-2xl overflow-hidden shadow-2xl shadow-black/20 flex flex-col h-[600px]">
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Profile Editor</h3>
                    <p className="text-xs text-muted-foreground">Powered by Fulcrum AI</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary p-3 rounded-2xl rounded-bl-md">
                      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tell me what we got wrong..."
                    className="flex-1 bg-secondary border-border"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                    variant="hero"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
