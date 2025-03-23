import { useState } from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MailOpen,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ACCENT_COLORS } from '@/lib/constants/colors';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  copyEmailContent,
  extractEmailAddress,
} from '@/lib/utils/email';
import { EmailBoxProps } from '@/types/email';

const EmailBox = ({ email, onDelete, onRead }: EmailBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRead, setIsRead] = useState(email.read);
  
  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isRead) {
      setIsRead(true);
      onRead();
    }
  };
  
  const handleCopyContent = () => {
    const textContent = copyEmailContent(email.content);
    navigator.clipboard.writeText(textContent);
    toast.success("Conteúdo copiado!", {
      description: "Agora é só colar onde precisar!",
      icon: "👍",
    });
  };

  const handleReplyClick = () => {
    const emailAddress = extractEmailAddress(email.from);
    window.open(`mailto:${emailAddress}`, '_blank');
  };

  const getRandomStyle = () => {
    const gradientIndex = Math.floor(Math.random() * ACCENT_COLORS.gradients.length);
    const borderIndex = Math.floor(Math.random() * ACCENT_COLORS.borders.length);
    return {
      gradient: ACCENT_COLORS.gradients[gradientIndex],
      border: ACCENT_COLORS.borders[borderIndex]
    };
  };
  
  const { gradient, border } = getRandomStyle();
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md relative",
        !isRead && 'bg-primary/5 border-primary/20',
        isOpen && `border-2 ${border}`
      )}
    >
      <div className="cursor-pointer relative" onClick={handleToggleOpen}>
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
              {!isRead && <span className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0" />}
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
          <p className="text-sm text-muted-foreground line-clamp-1">{email.preview}</p>
        </CardContent>
        
        <div className="px-4 pb-2 flex justify-between items-center">
          <div className="flex items-center text-xs text-muted-foreground">
            {isRead ? <MailOpen className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
            <span>{isRead ? "Lido" : "Não lido"}</span>
          </div>
          <ChevronDown 
            className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} 
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
                  onClick={handleCopyContent}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:underline relative z-10">Copiar</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="group relative overflow-hidden"
                  onClick={handleReplyClick}
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
