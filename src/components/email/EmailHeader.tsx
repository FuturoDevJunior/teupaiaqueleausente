
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Mail, MailOpen } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailHeaderProps {
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
}

const EmailHeader = ({ from, subject, preview, date, isRead }: EmailHeaderProps) => {
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

  return (
    <>
      <CardHeader className="p-4 pb-1 relative z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center">
            {!isRead ? (
              <span className="w-2 h-2 rounded-full bg-primary mr-2 flex-shrink-0" />
            ) : null}
            <span className="font-medium">{from}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatRelativeTime(date)}</span>
          </div>
        </div>
        <CardTitle className="text-base">{subject}</CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 py-2">
        <p className="text-sm text-muted-foreground line-clamp-1">
          {preview}
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
      </div>
    </>
  );
};

export default EmailHeader;
