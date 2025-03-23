
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchEmails, generateTemporaryEmail, Email as EmailType, deleteEmail, markEmailAsRead } from "@/lib/email-service";
import LoadingAnimation from "@/components/LoadingAnimation";
import CookieConsent from "@/components/CookieConsent";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import EmailGenerator from "@/components/email/EmailGenerator";
import EmailList from "@/components/email/EmailList";
import PrivacySection from "@/components/email/PrivacySection";
import HowItWorksSection from "@/components/email/HowItWorksSection";
import UseCasesSection from "@/components/email/UseCasesSection";

export default function Index() {
  const [email, setEmail] = useState("");
  const [generatingEmail, setGeneratingEmail] = useState(true);
  const [messages, setMessages] = useState<EmailType[]>([]);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Verificar consentimento de cookies no carregamento
  useEffect(() => {
    const hasConsent = localStorage.getItem("cookie_consent");
    if (!hasConsent) {
      // Atrasa a exibição para melhorar a experiência inicial
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

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
  }, []);

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

  // Verificar por novos emails
  const checkEmail = async (emailToCheck = email, silent = false) => {
    if (!emailToCheck) return;
    
    if (!silent) setCheckingEmail(true);
    
    try {
      const fetchedEmails = await fetchEmails(emailToCheck);
      
      if (fetchedEmails.length > 0) {
        // Filtra emails já existentes
        const newEmails = fetchedEmails.filter(newEmail => 
          !messages.some(existing => existing.id === newEmail.id)
        );
        
        if (newEmails.length > 0 && !silent) {
          toast.success(`${newEmails.length} ${newEmails.length === 1 ? 'novo email' : 'novos emails'} recebido${newEmails.length === 1 ? '' : 's'}!`, {
            description: "Confira sua caixa de entrada.",
            icon: "📩",
          });
        }
        
        setMessages(prev => [...newEmails, ...prev]);
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
        </main>
      </div>

      <AppFooter />

      <AnimatePresence>
        {showCookieConsent && (
          <CookieConsent onAccept={() => setShowCookieConsent(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
