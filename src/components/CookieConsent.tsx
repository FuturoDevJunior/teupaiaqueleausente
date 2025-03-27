import React, { useState } from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  Cookie,
  Info,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CookieConsentProps {
  onAccept: () => void;
  open?: boolean;
}

export default function CookieConsent({ onAccept, open = true }: CookieConsentProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    onAccept();
  };
  
  if (!open) return null;
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-card rounded-xl border shadow-lg overflow-hidden">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
              
              <div className="p-5 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0">
                    <Cookie className="h-10 w-10 text-indigo-500" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-1">
                      🍪 Este site usa cookies... ou não!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Na verdade, usamos armazenamento local para manter seu email temporário e garantir que tudo funcione corretamente. Não rastreamos você nem compartilhamos seus dados.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Button
                        onClick={handleAccept}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md w-full sm:w-auto"
                      >
                        Sim, concordo
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setShowDetails(!showDetails)}
                        className="group relative overflow-hidden w-full sm:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Info className="h-4 w-4 mr-2" />
                        <span className="relative z-10">
                          {showDetails ? "Menos detalhes" : "Mais detalhes"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleAccept} 
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors md:static md:hidden"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-sm bg-accent/50 p-4 rounded-lg"
                    >
                      <h4 className="font-medium mb-2">Quais dados armazenamos?</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>
                            <strong className="text-foreground">Identificador de sessão:</strong> Um ID único para manter seu email temporário enquanto a aba está aberta.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>
                            <strong className="text-foreground">Email temporário:</strong> Guardamos seu email temporário no armazenamento local do navegador.
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>
                            <strong className="text-foreground">Preferência de consentimento:</strong> Guardamos sua escolha para não mostrar este aviso novamente.
                          </span>
                        </li>
                      </ul>
                      
                      <h4 className="font-medium mt-4 mb-2">O que não fazemos:</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>Não rastreamos sua atividade de navegação.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>Não compartilhamos seus dados com terceiros.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-4 h-4 mr-2 text-indigo-500 font-bold">•</span>
                          <span>Não armazenamos cookies que persistem após você fechar o navegador.</span>
                        </li>
                      </ul>
                      
                      <p className="mt-4 italic">
                        "Como diria Peter Griffin: 'Cookies são como calcinhas. Ninguém quer saber que você está usando, mas ficam chateados quando descobrem que você não está usando nenhum!'"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
