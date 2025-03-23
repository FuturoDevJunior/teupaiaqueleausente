import React, { useState } from 'react';

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
import {
  Email,
  EmailBoxProps,
} from '@/types/email';

export default function EmailBox({
  email: emailAddress,
  emails,
  onRefresh,
  onNewEmail,
  onDeleteEmail,
  onReadEmail
}: EmailBoxProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggleOpen = (email: Email) => {
    setSelectedEmail(email);
    setIsOpen(!isOpen);
    if (!email.read) {
      onReadEmail(email.id);
    }
  };
  
  const handleCopyContent = () => {
    if (!selectedEmail) return;
    
    const textContent = copyEmailContent(selectedEmail.content);
    navigator.clipboard.writeText(textContent);
    toast.success("Conteúdo copiado!", {
      description: "Agora é só colar onde precisar!",
      icon: "👍",
    });
  };

  const handleReplyClick = () => {
    if (!selectedEmail) return;
    
    const emailAddress = extractEmailAddress(selectedEmail.from);
    window.open(`mailto:${emailAddress}`, '_blank');
  };

  const getRandomStyle = () => {
    const gradientIndex = Math.floor(Math.random() * ACCENT_COLORS.gradients.length);
    const borderIndex = Math.floor(Math.random() * ACCENT_COLORS.borders.length);
    return {
      gradient: ACCENT_COLORS.gradients[gradientIndex],
      border: ACCENT_COLORS.borders[borderIndex],
    };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{emailAddress}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={onNewEmail}>
            Novo Email
          </Button>
        </div>
      </div>

      {emails.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Mail className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-medium">Nenhum email recebido ainda</h3>
            <p className="text-sm text-muted-foreground">
              Os emails recebidos aparecerão aqui. Clique em "Atualizar" para verificar.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => {
            const { gradient, border } = getRandomStyle();
            
            return (
              <Card
                key={email.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 hover:shadow-md relative",
                  email.id === selectedEmail?.id && isOpen && `border-2 ${border}`,
                  !email.read && 'bg-primary/5 border-primary/20'
                )}
              >
                <div className="cursor-pointer relative" onClick={() => handleToggleOpen(email)}>
                  {email.id === selectedEmail?.id && isOpen && (
                    <div className="absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none z-0" />
                  )}
                  
                  {!email.read && (
                    <motion.div 
                      className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 z-10"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                  
                  <CardHeader className="p-4 pb-1 relative z-10">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        {!email.read && <span className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0" />}
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
                      {email.read ? <MailOpen className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                      <span>{email.read ? "Lido" : "Não lido"}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform", 
                        email.id === selectedEmail?.id && isOpen && "transform rotate-180"
                      )}
                    />
                  </div>
                </div>
                
                <AnimatePresence>
                  {email.id === selectedEmail?.id && isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`border-t px-4 py-4 ${gradient}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={handleCopyContent}>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copiar
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleReplyClick}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Responder
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (email.id) onDeleteEmail(email.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="bg-card rounded-lg p-4 shadow-sm">
                        <div
                          className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: email.content }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
