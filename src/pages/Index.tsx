import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { motion } from 'framer-motion';
import { toast } from 'sonner';

import EmailGenerator from '@/components/email/EmailGenerator';
import EmailList from '@/components/email/EmailList';
import HowItWorksSection from '@/components/email/HowItWorksSection';
import PrivacySection from '@/components/email/PrivacySection';
import UseCasesSection from '@/components/email/UseCasesSection';
import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import LoadingAnimation from '@/components/LoadingAnimation';
import {
  deleteEmail,
  Email as EmailType,
  fetchEmails,
  generateTemporaryEmail,
  markEmailAsRead,
} from '@/lib/email-service';

// Lazy loading para componentes pesados
// const EmailBox = lazy(() => import("@/components/EmailBox"));
const CookieConsent = lazy(() => import("@/components/CookieConsent"));
const EasterEgg = lazy(() => import("@/components/EasterEgg"));

// Hook personalizado para gerenciar o consentimento de cookies
function useCookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Verifica se já existe consentimento
    const hasConsent = localStorage.getItem("cookie_consent") === "true";
    
    if (!hasConsent) {
      // Atrasa a exibição para melhorar a experiência inicial
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const acceptCookies = useCallback(() => {
    localStorage.setItem("cookie_consent", "true");
    setShowConsent(false);
    // Notificação de confirmação
    toast.success("Preferências salvas", {
      description: "Suas preferências de privacidade foram salvas.",
      icon: "✓",
      duration: 3000,
    });
  }, []);
  
  return {
    showConsent,
    acceptCookies
  };
}

export default function Index() {
  const [email, setEmail] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(true);
  const [messages, setMessages] = useState<EmailType[]>([]);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showConsent, acceptCookies } = useCookieConsent();

  // Verificar por novos emails
  const checkEmail = useCallback(async (emailToCheck = email, silent = false) => {
    if (!emailToCheck) return;
    
    if (!silent) setCheckingEmail(true);
    
    try {
      const fetchedEmails = await fetchEmails(emailToCheck);
      
      if (fetchedEmails.length > 0) {
        // Melhorar a deduplicação dos emails
        const newEmails = fetchedEmails.filter(newEmail => 
          !messages.some(existing => 
            // Comparar por ID e também por conteúdo se os IDs forem diferentes
            existing.id === newEmail.id || 
            (existing.from === newEmail.from && 
             existing.subject === newEmail.subject && 
             existing.date === newEmail.date)
          )
        );
        
        // Limitar a quantidade de emails mostrados para evitar sobrecarga
        const MAX_DISPLAYED_EMAILS = 20;
        
        if (newEmails.length > 0 && !silent) {
          toast.success(`${newEmails.length} ${newEmails.length === 1 ? 'novo email' : 'novos emails'} recebido${newEmails.length === 1 ? '' : 's'}!`, {
            description: "Confira sua caixa de entrada.",
            icon: "📩",
          });
          
          // Atualizar a lista de emails, mantendo dentro do limite
          setMessages(prev => {
            const combined = [...newEmails, ...prev];
            return combined.slice(0, MAX_DISPLAYED_EMAILS);
          });
        } else if (!silent && fetchedEmails.length > 0 && newEmails.length === 0) {
          // Se não houve emails novos, mas temos emails
          toast.info("Nenhum email novo", {
            description: "Todos os emails já estão na sua caixa.",
            icon: "📭",
          });
        }
      } else if (!silent) {
        toast.info("Nenhum email novo", {
          description: "Sua caixa está vazia.",
          icon: "📭",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar emails:", error);
      if (!silent) {
        toast.error("Erro ao verificar emails", {
          description: "Tente novamente em alguns instantes.",
        });
      }
    } finally {
      if (!silent) setCheckingEmail(false);
    }
  }, [email, messages]);

  // Inicializar o aplicativo e gerar email temporário
  useEffect(() => {
    async function initApp() {
      try {
        const newEmail = await generateTemporaryEmail();
        setEmail(newEmail);
        await checkEmail(newEmail);
      } catch (error) {
        console.error("Erro ao inicializar:", error);
        toast.error("Erro ao inicializar. Tentando novamente...");
      } finally {
        setGeneratingEmail(false);
        setIsLoaded(true);
      }
    }
    
    initApp();
    
    // Verificar por novos emails periodicamente
    const interval = setInterval(() => {
      if (email) checkEmail(email, true);
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [email, checkEmail]);
  
  // Gerar novo email temporário
  const generateNewEmail = async () => {
    setGeneratingEmail(true);
    setMessages([]);
    
    try {
      const newEmail = await generateTemporaryEmail(true);
      setEmail(newEmail);
      
      toast.success("Novo email gerado!", {
        description: "Este email dura até você fechar a aba!",
        icon: "📬",
      });
      
      await checkEmail(newEmail);
    } catch (error) {
      console.error("Erro ao gerar email:", error);
      toast.error("Erro ao gerar email", {
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setGeneratingEmail(false);
    }
  };

  // Excluir um email
  const handleDeleteEmail = async (id: string) => {
    try {
      await deleteEmail(id);
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error("Erro ao excluir email:", error);
    }
  };
  
  // Marcar email como lido
  const handleReadEmail = async (id: string) => {
    try {
      await markEmailAsRead(id);
      setMessages(messages.map(message => 
        message.id === id ? { ...message, read: true } : message
      ));
    } catch (error) {
      console.error("Erro ao marcar email como lido:", error);
    }
  };

  // Exibir tela de carregamento inicial
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <LoadingAnimation />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/5 overflow-x-hidden">
      <div className="container px-4 py-6 md:py-8 mx-auto flex-1">
        <AppHeader />

        <main className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-xl border shadow-lg p-5 md:p-7 mb-8 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl pointer-events-none" />
            
            <EmailGenerator 
              email={email}
              generatingEmail={generatingEmail}
              onGenerateNew={generateNewEmail}
            />

            <EmailList 
              messages={messages}
              checkingEmail={checkingEmail}
              onCheckEmails={() => checkEmail()}
              onDeleteEmail={handleDeleteEmail}
              onReadEmail={handleReadEmail}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <PrivacySection />
            <HowItWorksSection />
          </div>

          <UseCasesSection />

          {/* Easter egg: isso não faz nada útil, é apenas uma piada */}
          {email.includes("pai") && (
            <Suspense fallback={null}>
              <EasterEgg />
            </Suspense>
          )}
        </main>
      </div>

      <AppFooter />
      
      {/* Componente de consentimento de cookies usando o hook personalizado */}
      <Suspense fallback={null}>
        <CookieConsent
          open={showConsent}
          onAccept={acceptCookies}
        />
      </Suspense>
    </div>
  );
}
