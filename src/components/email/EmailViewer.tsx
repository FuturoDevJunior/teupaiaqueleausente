import {
  useRef,
  useState,
} from 'react';

import { format } from 'date-fns';
import {
  ChevronLeft,
  Clock,
  File,
  Mail,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Email } from '@/lib/email-service';

export interface EmailViewerProps {
  email: Email | null;
  onClose: () => void;
  onDeleteEmail: (id: string) => void;
}

export default function EmailViewer({ email, onClose, onDeleteEmail }: EmailViewerProps) {
  const [printing, setPrinting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!email) return null;
  
  const handlePrint = () => {
    if (contentRef.current) {
      setPrinting(true);
      
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.write(`
            <html>
              <head>
                <title>${email.subject}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  .header { margin-bottom: 20px; }
                  .content { white-space: pre-wrap; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h2>${email.subject}</h2>
                  <p><strong>De:</strong> ${email.from}</p>
                  <p><strong>Data:</strong> ${format(new Date(email.date), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <hr />
                <div class="content">${email.content}</div>
              </body>
            </html>
          `);
          doc.close();
          
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Remove o iframe após a impressão
          setTimeout(() => {
            document.body.removeChild(iframe);
            setPrinting(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao imprimir:', error);
        setPrinting(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrint}
            disabled={printing}
          >
            <File className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              onDeleteEmail(email.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b bg-muted/30">
        <h2 className="text-xl font-medium mb-4">{email.subject}</h2>
        <div className="flex flex-col space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{email.from}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(email.date), 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div ref={contentRef} className="flex-1 p-4 overflow-auto whitespace-pre-wrap text-sm">
        {email.content}
      </div>
    </div>
  );
} 