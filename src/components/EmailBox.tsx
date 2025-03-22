
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Trash2, 
  Copy,
  Clock, 
  Mail, 
  MailOpen,
  ExternalLink,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "agora mesmo";
    } else if (diffInMinutes < 60) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return format(date, "dd MMM 'às' HH:mm", { locale: ptBR });
    }
  };
  
  const copyContent = () => {
    const tempElement = document.createElement("div");
    tempElement.innerHTML = email.content;
    const textContent = tempElement.textContent || tempElement.innerText || "";
    navigator.clipboard.writeText(textContent);
    toast.success("Conteúdo copiado!", {
      description: "Agora é só colar onde precisar!",
      icon: "👍",
    });
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
        
        <CardHeader className="p-4 pb-1 relative z-10">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center">
              {!isRead ? (
                <span className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0" />
              ) : null}
              <span className="font-medium">{email.from}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatRelativeTime(email.date)}</span>
            </div>
          </div>
          <CardTitle className="text-base">{email.subject}</CardTitle>
        </CardHeader>
        
        <CardContent className="px-4 py-2">
          <p className="text-sm text-muted-foreground line-clamp-1">
            {email.preview}
          </p>
        </CardContent>
        
        <div className="px-4 pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            {isRead ? (
              <MailOpen className="h-3 w-3 mr-1" />
            ) : (
              <Mail className="h-3 w-3 mr-1" />
            )}
            <span>{isRead ? "Lido" : "Não lido"}</span>
          </div>
          
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 border-t border-border relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-accent/40 pointer-events-none z-0" />
              <div className="absolute inset-0 bg-gradient-to-r opacity-30 pointer-events-none z-0" />
              
              <div className="bg-card rounded-lg p-4 mb-4 shadow-md relative z-10">
                <div
                  className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: email.content }}
                />
              </div>
              
              <div className="flex justify-end space-x-2 relative z-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden"
                  onClick={copyContent}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline relative z-10">Copiar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden"
                  onClick={() => window.open(`mailto:${email.from.split('<')[1]?.replace('>', '') || ''}`, '_blank')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline relative z-10">Responder</span>
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="group relative overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline relative z-10">Excluir</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default EmailBox;
