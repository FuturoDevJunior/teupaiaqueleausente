import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatRelativeTime = (dateString: string): string => {
  try {
    if (!dateString) return "data desconhecida";

    const now = new Date();
    const date = new Date(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return "data inválida";
    }
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "agora mesmo";
    } 
    
    if (diffInMinutes < 60) {
      return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } 
    
    return format(date, "dd MMM 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "data inválida";
  }
}; 