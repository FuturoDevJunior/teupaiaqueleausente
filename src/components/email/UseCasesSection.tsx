
import { motion } from "framer-motion";

export default function UseCasesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card rounded-xl border shadow-md p-5 md:p-7 mb-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-indigo-500/5 pointer-events-none" />
      
      <h2 className="text-xl font-semibold mb-4">Usos populares</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-accent/50 dark:bg-accent/20 rounded-lg p-4 relative group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-medium mb-2 text-foreground">Fóruns & Comentários</h3>
          <p className="text-sm text-muted-foreground">Evite spam ao participar de discussões online ou deixar comentários.</p>
        </div>
        
        <div className="bg-accent/50 dark:bg-accent/20 rounded-lg p-4 relative group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-medium mb-2 text-foreground">Testes & Trials</h3>
          <p className="text-sm text-muted-foreground">Teste novos serviços e períodos de avaliação sem comprometer seu email real.</p>
        </div>
        
        <div className="bg-accent/50 dark:bg-accent/20 rounded-lg p-4 relative group hover:shadow-md transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-medium mb-2 text-foreground">Downloads & PDFs</h3>
          <p className="text-sm text-muted-foreground">Baixe e-books, PDFs e outros conteúdos sem encher sua caixa de spam.</p>
        </div>
      </div>
    </motion.div>
  );
}
