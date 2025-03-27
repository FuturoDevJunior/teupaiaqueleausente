import { useMemo } from 'react';

import { format } from 'date-fns';
import {
  Mail,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Email } from '@/lib/email-service';
import { cn } from '@/lib/utils';

interface EmailListProps {
  messages: Email[];
  checkingEmail: boolean;
  onCheckEmails: () => void;
  onDeleteEmail: (id: string) => void;
  onReadEmail: (id: string) => void;
}

export default function EmailList({
  messages,
  checkingEmail,
  onCheckEmails,
  onDeleteEmail,
  onReadEmail,
}: EmailListProps) {
  const sortedEmails = useMemo(() => {
    return [...messages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [messages]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Caixa de Entrada</h3>
          <Button variant="ghost" size="icon" onClick={onCheckEmails} disabled={checkingEmail}>
            <RefreshCw className={cn('h-4 w-4', checkingEmail && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-grow p-0">
        {checkingEmail ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sortedEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Mail className="w-12 h-12 mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">Nenhum email recebido</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Os emails recebidos aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="mt-4 max-h-[350px] overflow-y-auto pr-2">
            {sortedEmails.map((email) => (
              <button
                key={email.id}
                className={cn(
                  'w-full flex flex-col text-left p-3 hover:bg-muted/50 transition-colors relative group',
                  !email.read && 'font-medium'
                )}
                onClick={() => {
                  if (!email.read) {
                    onReadEmail(email.id);
                  }
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      {!email.read && (
                        <span className="w-2 h-2 bg-primary rounded-full mr-2" />
                      )}
                      <p
                        className={cn(
                          'truncate text-sm',
                          !email.read && 'font-semibold'
                        )}
                      >
                        {email.from}
                      </p>
                    </div>
                    <h4 className="truncate font-medium text-sm mt-1">{email.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {email.preview}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(email.date), 'dd/MM/yyyy')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEmail(email.id);
                  }}
                >
                  <span className="sr-only">Excluir email</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </button>
            ))}
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="p-2 text-xs text-muted-foreground">
        {messages.length} email{messages.length !== 1 ? 's' : ''} recebido{messages.length !== 1 ? 's' : ''}
      </CardFooter>
    </Card>
  );
}
