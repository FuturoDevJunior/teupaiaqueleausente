
import { encrypt } from "./crypto-utils";
import { supabase } from "@/integrations/supabase/client";

// Chaves para armazenamento local
export const SESSION_STORAGE_KEY = "teupaiausente_session_id";
export const EMAIL_STORAGE_KEY = "current_temp_email";

/**
 * Gera ou recupera o ID da sessão do usuário
 */
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  
  if (!sessionId) {
    // Importação dinâmica para evitar problemas de referências circulares
    const { generateSessionId } = require("./crypto-utils");
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Recupera o email armazenado na sessão atual
 */
export const getStoredEmail = (): string | null => {
  return localStorage.getItem(EMAIL_STORAGE_KEY);
};

/**
 * Armazena o email na sessão atual
 */
export const storeEmail = (email: string): void => {
  localStorage.setItem(EMAIL_STORAGE_KEY, email);
};

/**
 * Armazena um novo email temporário no Supabase
 */
export const storeEmailInSupabase = async (email: string, sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('temp_emails')
      .insert({
        email: encrypt(email),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        session_id: sessionId,
        deleted: false
      });
    
    if (error) {
      console.error("Erro ao inserir no Supabase:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao armazenar email no Supabase:", error);
    return false;
  }
};
