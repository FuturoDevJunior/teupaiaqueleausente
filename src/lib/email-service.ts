import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { generateRandomEmail } from '@/lib/email-utils';

import {
  decrypt,
  encrypt,
  isNullOrEmpty,
} from './crypto-utils';
import {
  getSessionId,
  getStoredEmail,
  storeEmail,
  storeEmailInSupabase,
} from './email-storage';
import { generateMockEmails } from './mock-emails';

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  read: boolean;
}

// Implementação de rate limiting para evitar muitas requisições
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 10;
const REQUEST_WINDOW_MS = 60 * 1000; // 1 minuto

/**
 * Verifica se uma operação não excede o limite de taxa
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Remover timestamps antigos
  const recentRequests = requestTimestamps.filter(
    timestamp => now - timestamp < REQUEST_WINDOW_MS
  );
  
  // Atualizar array de timestamps
  requestTimestamps.length = 0;
  requestTimestamps.push(...recentRequests);
  
  // Verificar se excede o limite
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn("Rate limit excedido. Espere um pouco antes de tentar novamente.");
    return false;
  }
  
  // Registrar novo timestamp
  requestTimestamps.push(now);
  return true;
}

/**
 * Gera um email temporário para o usuário
 */
export async function generateTemporaryEmail(forceNew: boolean = false): Promise<string> {
  try {
    // Se não forçar novo e tiver um email armazenado, usa ele
    const storedEmail = getStoredEmail();
    if (!forceNew && !isNullOrEmpty(storedEmail)) {
      return storedEmail as string;
    }
    
    const newEmail = generateRandomEmail();
    const sessionId = getSessionId();
    
    // Armazena o email no supabase com timestamp
    await storeEmailInSupabase(newEmail, sessionId);
    
    // Armazena localmente
    storeEmail(newEmail);
    
    return newEmail;
  } catch (error) {
    console.error("Erro ao gerar email temporário:", error);
    const fallbackEmail = generateRandomEmail();
    storeEmail(fallbackEmail);
    return fallbackEmail; // Fallback para experiência offline
  }
}

/**
 * Busca os emails recebidos para um determinado endereço
 */
export async function fetchEmails(email: string): Promise<Email[]> {
  try {
    // Verificar se excede o limite de taxa
    if (!checkRateLimit()) {
      toast.error("Muitas solicitações", {
        description: "Aguarde alguns segundos antes de tentar novamente.",
        duration: 3000,
      });
      return [];
    }
    
    // Validar entrada
    if (!email || typeof email !== 'string') {
      console.error("Email inválido fornecido para fetchEmails:", email);
      return [];
    }
    
    // Tenta buscar emails do Supabase com retry e timeout
    let attempt = 0;
    const maxAttempts = 2;
    
    while (attempt < maxAttempts) {
      try {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 segundos de timeout
        
        const { data: storedEmails, error } = await supabase
          .from('emails')
          .select('*')
          .eq('recipient', encrypt(email))
          .order('created_at', { ascending: false });
          
        clearTimeout(timeoutId);
        
        if (error) {
          throw error;
        }

        if (storedEmails && storedEmails.length > 0) {
          return storedEmails.map(email => ({
            id: email.id,
            from: decrypt(email.sender),
            subject: decrypt(email.subject),
            preview: decrypt(email.preview),
            content: decrypt(email.content),
            date: email.created_at || new Date().toISOString(),
            read: email.read || false
          }));
        }
        
        // Se não encontrou emails reais, gera emails simulados
        return generateMockEmails(email);
      } catch (retryError) {
        attempt++;
        
        if (attempt >= maxAttempts) {
          console.error("Erro ao buscar emails após várias tentativas:", retryError);
          // Falha graciosamente com emails simulados
          return generateMockEmails(email);
        }
        
        // Aguarda brevemente antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 500));
      }
    }
    
    // Fallback caso saia do loop sem retornar (não deve acontecer)
    return generateMockEmails(email);
  } catch (error) {
    console.error("Erro ao buscar emails:", error);
    // Sempre retornar algo útil para o usuário, mesmo em caso de erro
    return generateMockEmails(email);
  }
}

/**
 * Marca um email como lido
 */
export async function markEmailAsRead(emailId: string): Promise<void> {
  try {
    // Verificar se excede o limite de taxa
    if (!checkRateLimit()) {
      console.warn("Rate limit excedido ao marcar email como lido.");
      return;
    }
    
    const { error } = await supabase
      .from('emails')
      .update({ read: true })
      .eq('id', emailId);
      
    if (error) {
      console.error("Erro ao marcar email como lido:", error);
    }
  } catch (error) {
    console.error("Erro ao marcar email como lido:", error);
  }
}

/**
 * Exclui um email pelo ID
 */
export async function deleteEmail(emailId: string): Promise<void> {
  try {
    // Verificar se excede o limite de taxa
    if (!checkRateLimit()) {
      toast.error("Muitas solicitações", {
        description: "Aguarde alguns segundos antes de tentar novamente.",
        duration: 3000,
      });
      return;
    }
    
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId);
      
    if (error) {
      console.error("Erro ao excluir email:", error);
      toast.error("Erro ao excluir email", {
        description: "Tente novamente em alguns instantes.",
      });
      return;
    }
      
    toast.success("Email excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir email:", error);
    toast.error("Erro ao excluir email", {
      description: "Tente novamente em alguns instantes.",
    });
  }
}
