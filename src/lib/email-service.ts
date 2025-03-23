
import { supabase } from "@/integrations/supabase/client";
import { generateRandomEmail } from "@/lib/email-utils";
import { toast } from "sonner";
import { encrypt, decrypt, isNullOrEmpty } from "./crypto-utils";
import { getSessionId, getStoredEmail, storeEmail, storeEmailInSupabase } from "./email-storage";
import { generateMockEmails } from "./mock-emails";

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  read: boolean;
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
    // Tenta buscar emails do Supabase
    const { data: storedEmails, error } = await supabase
      .from('emails')
      .select('*')
      .eq('recipient', encrypt(email))
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar emails:", error);
      // Continua com emails simulados para garantir experiência fluida
    }

    if (storedEmails && storedEmails.length > 0) {
      return storedEmails.map(email => ({
        id: email.id,
        from: decrypt(email.sender),
        subject: decrypt(email.subject),
        preview: decrypt(email.preview),
        content: decrypt(email.content),
        date: email.created_at,
        read: email.read
      }));
    }
    
    // Para fins de demonstração, geramos emails simulados com base no email
    return generateMockEmails(email);
  } catch (error) {
    console.error("Erro ao buscar emails:", error);
    return generateMockEmails(email); // Fallback para experiência offline
  }
}

/**
 * Marca um email como lido
 */
export async function markEmailAsRead(emailId: string): Promise<void> {
  try {
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
    const { error } = await supabase
      .from('emails')
      .delete()
      .eq('id', emailId);
      
    if (error) {
      console.error("Erro ao excluir email:", error);
      toast.error("Erro ao excluir email, tente novamente.");
      return;
    }
      
    toast.success("Email excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir email:", error);
    toast.error("Erro ao excluir email, tente novamente.");
  }
}
