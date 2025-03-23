
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Lock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface EmailGeneratorProps {
  email: string;
  generatingEmail: boolean;
  onGenerateNew: () => void;
}

const EmailGenerator = ({ email, generatingEmail, onGenerateNew }: EmailGeneratorProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    toast.success("Email copiado!", {
      description: "Agora é só colar onde precisar.",
      icon: "📋",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Seu email temporário</h2>
          <motion.div 
            className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            <Clock className="h-3 w-3" />
            Permanente
          </motion.div>
        </div>
        {generatingEmail ? (
          <Skeleton className="h-9 w-full max-w-md" />
        ) : (
          <div className="flex items-center bg-accent/50 dark:bg-accent/20 rounded-lg p-2 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" />
            <p className="font-mono text-lg truncate">{email}</p>
            <motion.div
              className="ml-2 text-green-500 dark:text-green-400"
              whileHover={{ scale: 1.2, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Email criptografado e seguro"
            >
              <Lock className="h-4 w-4" />
            </motion.div>
          </div>
        )}
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="default"
          size="sm"
          className="flex-1 sm:flex-none group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md"
          onClick={copyToClipboard}
          disabled={generatingEmail}
        >
          <Copy className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
          Copiar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none group hover:border-purple-400 dark:hover:border-purple-700 bg-gradient-to-br from-transparent to-purple-50 hover:to-purple-100 dark:hover:to-purple-900/30 shadow-sm"
          onClick={onGenerateNew}
          disabled={generatingEmail}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${generatingEmail ? "animate-spin" : ""} group-hover:scale-110 transition-transform`} />
          Novo
        </Button>
      </div>
    </div>
  );
};

export default EmailGenerator;
