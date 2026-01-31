import { useState } from "react";
import { motion } from "framer-motion";
import { ProfileSidebar } from "./ProfileSidebar";
import { FocusCard, ImpactOpportunity } from "./FocusCard";
import { CivicTodoList, TodoItem } from "./CivicTodoList";
import { ChatbotModal } from "./ChatbotModal";

interface DashboardProps {
  userProfile: {
    drives: boolean;
    owns: boolean;
    hasChildren: boolean;
  };
  onUpdateProfile: (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => void;
}

// Mock data for opportunities
const generateOpportunities = (profile: { drives: boolean; owns: boolean; hasChildren: boolean }): ImpactOpportunity[] => {
  const opportunities: ImpactOpportunity[] = [];

  if (profile.drives) {
    opportunities.push({
      id: "parking-1",
      type: "vote",
      urgency: "urgent",
      title: "Parking Meter Extension Prop C",
      description: "This proposition would extend parking meter hours from 6pm to 10pm in commercial districts across San Francisco.",
      impact: "Because you drive and live in the Mission, this will cost you an estimated ~$400/year in additional parking fees.",
      location: "City Hall, Polling Station #24",
      date: "November 5th",
      costImpact: "~$400/year additional cost",
    });
  }

  if (!profile.owns) {
    opportunities.push({
      id: "rent-1",
      type: "meeting",
      urgency: "soon",
      title: "Rent Control Board Hearing",
      description: "The Rent Board is reviewing new guidelines for annual rent increases. Public comment period is open.",
      impact: "As a renter in the Mission District, proposed changes could affect your maximum annual rent increase by 1.5%.",
      location: "25 Van Ness Ave, Room 400",
      date: "Tuesday, 2:00 PM",
    });
  }

  if (profile.hasChildren) {
    opportunities.push({
      id: "school-1",
      type: "meeting",
      urgency: "upcoming",
      title: "SFUSD Budget Allocation Meeting",
      description: "The school board will discuss the upcoming year's budget priorities including arts programs and teacher salaries.",
      impact: "Schools in your district are slated for potential program cuts. Your voice could influence the final allocation.",
      location: "SFUSD Headquarters, Board Room",
      date: "Next Thursday, 6:00 PM",
    });
  }

  opportunities.push({
    id: "transit-1",
    type: "action",
    urgency: "upcoming",
    title: "16th Street BART Plaza Redesign",
    description: "SFMTA is seeking community input on the redesign of the 16th Street BART plaza, including safety improvements and vendor space.",
    impact: "This is your local transit hub. Your input will shape how the space serves the Mission community.",
    location: "16th Street BART Station",
    date: "Community Survey Open Now",
  });

  return opportunities;
};

export const Dashboard = ({ userProfile, onUpdateProfile }: DashboardProps) => {
  const [opportunities, setOpportunities] = useState<ImpactOpportunity[]>(() => 
    generateOpportunities(userProfile)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentOpportunity = opportunities[currentIndex] ?? null;

  const handleDismiss = () => {
    if (currentIndex < opportunities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(opportunities.length); // Show "all caught up"
    }
  };

  const handleAccept = () => {
    if (currentOpportunity) {
      const newTodo: TodoItem = {
        id: currentOpportunity.id,
        action: generateActionText(currentOpportunity),
        location: currentOpportunity.location,
        date: currentOpportunity.date,
        completed: false,
      };
      setTodoItems([...todoItems, newTodo]);
      handleDismiss();
    }
  };

  const handleToggleTodo = (id: string) => {
    setTodoItems(
      todoItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleProfileUpdate = (updates: Partial<{ drives: boolean; owns: boolean; hasChildren: boolean }>) => {
    onUpdateProfile(updates);
    // Regenerate opportunities based on new profile
    const newProfile = { ...userProfile, ...updates };
    setOpportunities(generateOpportunities(newProfile));
    setCurrentIndex(0);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Profile */}
      <ProfileSidebar 
        userProfile={userProfile} 
        onEditProfile={() => setIsChatOpen(true)} 
      />

      {/* Center - Focus Feed */}
      <main className="flex-1 flex items-center justify-center p-8">
        <FocusCard
          opportunity={currentOpportunity}
          onDismiss={handleDismiss}
          onAccept={handleAccept}
        />
      </main>

      {/* Right Sidebar - To-Do List */}
      <CivicTodoList items={todoItems} onToggle={handleToggleTodo} />

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUpdateProfile={handleProfileUpdate}
      />
    </div>
  );
};

function generateActionText(opportunity: ImpactOpportunity): string {
  switch (opportunity.type) {
    case "vote":
      return `Vote on ${opportunity.title}`;
    case "meeting":
      return `Attend hearing for ${opportunity.title}`;
    case "action":
      return `Participate in ${opportunity.title}`;
    default:
      return opportunity.title;
  }
}
