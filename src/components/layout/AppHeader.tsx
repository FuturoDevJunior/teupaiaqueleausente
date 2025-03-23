
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import FamilyGuyQuote from "@/components/FamilyGuyQuote";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AppHeader() {
  return (
    <header className="text-center mb-6 md:mb-8 mt-2 md:mt-4 relative">
      <div className="absolute top-0 right-0 md:right-4">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
          <Mail className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Teu<span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500">Pai</span>
          <span className="text-2xl md:text-3xl font-medium ml-2">aquele ausente</span>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Email temporário grátis que dura até você fechar a aba. 
          Tipo seu pai que foi comprar cigarro.
        </p>
        <FamilyGuyQuote />
      </motion.div>
    </header>
  );
}
