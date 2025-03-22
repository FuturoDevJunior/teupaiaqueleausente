
import { motion } from "framer-motion";
import { InfoIcon } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card rounded-xl border shadow-md p-5 md:p-7 relative overflow-hidden"
    >
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-pink-300/20 to-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <InfoIcon className="h-5 w-5 mr-2 text-purple-500" />
        Como funciona?
      </h2>
      
      <ul className="space-y-4">
        <li className="relative pl-7">
          <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">1</div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Copie seu email temporário</span> e use-o onde precisar se registrar ou receber mensagens.
          </p>
        </li>
        <li className="relative pl-7">
          <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">2</div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Receba mensagens instantaneamente</span> sem precisar criar conta ou fornecer dados pessoais.
          </p>
        </li>
        <li className="relative pl-7">
          <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">3</div>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Seu email permanece ativo</span> até você fechar a aba, depois é apagado por completo.
          </p>
        </li>
      </ul>
    </motion.div>
  );
}
