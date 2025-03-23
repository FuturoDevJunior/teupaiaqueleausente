import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  Info,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Email } from '@/lib/email-service';

import EmailBox from './EmailBox';

interface EmailListProps {
  messages: Email[];
  checkingEmail: boolean;
  onCheckEmails: () => void;
  onDeleteEmail: (id: string) => void;
  onReadEmail: (id: string) => void;
}

const EmailList = ({ 
  messages, 
  checkingEmail, 
  onCheckEmails, 
  onDeleteEmail, 
  onReadEmail 
}: EmailListProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center">
          <h3 className="font-semibold">Caixa de entrada</h3>
          <div className="ml-2 flex items-center text-xs text-muted-foreground">
            <Mail className="h-3 w-3 mr-1" />
            <span>{messages.length} mensagens</span>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-1 cursor-help">
                  <Info className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-52">
                  Limite de 10 atualizações por minuto para evitar sobrecarga.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="group hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-700 shadow-sm transition-all duration-300"
          onClick={onCheckEmails}
          disabled={checkingEmail}
        >
          <svg 
            className={`h-4 w-4 mr-1 ${checkingEmail ? "animate-spin text-primary" : ""} group-hover:scale-110 transition-transform`}
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          {checkingEmail ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border/70 min-h-[300px] overflow-hidden shadow-sm relative z-10">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[300px] flex flex-col items-center justify-center text-center p-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5,
                    repeatType: "mirror"
                  }}
                >
                  <Mail className="h-12 w-12 text-muted-foreground/30 mb-3" />
                </motion.div>
              </div>
              <h3 className="font-medium text-muted-foreground mb-1">Caixa de entrada vazia</h3>
              <p className="text-sm text-muted-foreground/70 max-w-sm">
                Os emails recebidos aparecerão aqui. Use o botão "Atualizar" para verificar por novas mensagens.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4 max-h-[400px] overflow-y-auto"
            >
              {checkingEmail && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-muted/40 rounded-md p-2 mb-2 text-center text-sm text-muted-foreground"
                >
                  <svg 
                    className="h-3 w-3 animate-spin inline-block mr-1"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  <span>Verificando novos emails...</span>
                </motion.div>
              )}
              
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmailBox 
                      email={message} 
                      onDelete={() => onDeleteEmail(message.id)}
                      onRead={() => onReadEmail(message.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default EmailList;
