
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import EmailHeader from "./EmailHeader";
import EmailContent from "./EmailContent";

interface EmailProps {
  email: {
    id: string;
    from: string;
    subject: string;
    preview: string;
    date: string;
    read: boolean;
    content: string;
  };
  onDelete: () => void;
  onRead: () => void;
}

const EmailBox = ({ email, onDelete, onRead }: EmailProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRead, setIsRead] = useState(email.read);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isRead) {
      setIsRead(true);
      onRead();
    }
  };
  
  const getRandomAccentColor = () => {
    const colors = [
      "from-amber-500/10 to-amber-500/5", 
      "from-sky-500/10 to-sky-500/5", 
      "from-emerald-500/10 to-emerald-500/5", 
      "from-rose-500/10 to-rose-500/5", 
      "from-violet-500/10 to-violet-500/5", 
      "from-indigo-500/10 to-indigo-500/5",
      "from-purple-500/10 to-purple-500/5"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const getBorderAccentColor = () => {
    const colors = [
      "border-amber-300/50", "border-sky-300/50", "border-emerald-300/50", 
      "border-rose-300/50", "border-violet-300/50", "border-indigo-300/50",
      "border-purple-300/50"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const accentGradient = getRandomAccentColor();
  const borderAccent = getBorderAccentColor();
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md relative",
        !isRead ? 'bg-primary/5 border-primary/20' : '',
        isOpen ? `border-2 ${borderAccent}` : ''
      )}
    >
      <div
        className="cursor-pointer relative"
        onClick={toggleOpen}
      >
        {isOpen && (
          <div className="absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none z-0" />
        )}
        
        {!isRead && (
          <motion.div 
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 z-10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
        
        <EmailHeader 
          from={email.from}
          subject={email.subject}
          preview={email.preview}
          date={email.date}
          isRead={isRead}
        />
        
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform mx-4 mb-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmailContent 
              content={email.content}
              from={email.from}
              onDelete={onDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default EmailBox;
