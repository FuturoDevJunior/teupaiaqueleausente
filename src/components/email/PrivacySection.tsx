
import { motion } from "framer-motion";
import { Shield, Star } from "lucide-react";

export default function PrivacySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl border shadow-md p-5 md:p-7 relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-indigo-500" />
        Privacidade & Segurança
      </h2>
      
      <ul className="space-y-3">
        <li className="flex items-start">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-1 rounded-full mr-3 mt-0.5">
            <Star className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Criptografia AES</span> - Seus emails são criptografados usando AES-256, protegendo seu conteúdo.
          </p>
        </li>
        <li className="flex items-start">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-1 rounded-full mr-3 mt-0.5">
            <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Sem rastreamento</span> - Não coletamos seus dados pessoais nem inserimos rastreadores.
          </p>
        </li>
        <li className="flex items-start">
          <div className="bg-pink-100 dark:bg-pink-900/40 p-1 rounded-full mr-3 mt-0.5">
            <Star className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Persistência local</span> - Seu email permanece até você fechar a aba do navegador.
          </p>
        </li>
      </ul>
    </motion.div>
  );
}
