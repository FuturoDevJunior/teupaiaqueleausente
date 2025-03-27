import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import {
  deleteEmail,
  Email,
  fetchEmails,
  generateTemporaryEmail,
  markEmailAsRead,
} from '@/lib/email-service';

export function useEmails() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Gerar ou recuperar email temporário
  const generateEmail = useCallback(async (forceNew = false) => {
    setLoading(true);
    try {
      const email = await generateTemporaryEmail(forceNew);
      setCurrentEmail(email);
      return email;
    } catch (error) {
      console.error('Erro ao gerar email:', error);
      toast.error('Erro ao gerar email temporário');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar emails
  const loadEmails = useCallback(async (emailAddress: string) => {
    if (!emailAddress) return;
    
    setRefreshing(true);
    try {
      const fetchedEmails = await fetchEmails(emailAddress);
      setEmails(fetchedEmails);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      toast.error('Erro ao carregar emails');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Marcar email como lido
  const markAsRead = useCallback(async (emailId: string) => {
    try {
      await markEmailAsRead(emailId);
      setEmails(prev => 
        prev.map(email => 
          email.id === emailId ? { ...email, read: true } : email
        )
      );
    } catch (error) {
      console.error('Erro ao marcar email como lido:', error);
    }
  }, []);

  // Excluir email
  const removeEmail = useCallback(async (emailId: string) => {
    try {
      await deleteEmail(emailId);
      setEmails(prev => prev.filter(email => email.id !== emailId));
    } catch (error) {
      console.error('Erro ao excluir email:', error);
    }
  }, []);

  // Configurar inscrição em tempo real para novos emails
  useEffect(() => {
    if (!currentEmail) return;

    // Carregar emails iniciais
    loadEmails(currentEmail);

    // Configurar inscrição em tempo real
    const subscription = supabase
      .channel('emails-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'emails',
      }, async (payload) => {
        // Verificar se o email é para o endereço atual
        if (payload.new) {
          // Os emails são criptografados no banco, então atualizamos todos
          // e deixamos a filtragem para o servidor
          try {
            // Atualizar lista de emails
            await loadEmails(currentEmail);
            
            // Notificar usuário
            toast.info('Novo email recebido!', {
              description: 'Você recebeu uma nova mensagem.',
              duration: 5000,
            });
          } catch (error) {
            console.error('Erro ao processar novo email:', error);
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentEmail, loadEmails]);

  return {
    emails,
    loading,
    refreshing,
    currentEmail,
    generateEmail,
    loadEmails,
    markAsRead,
    removeEmail
  };
} 