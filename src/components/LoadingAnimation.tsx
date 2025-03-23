import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="w-32 h-32 relative mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-70 blur-lg"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        
        <motion.div
          className="absolute inset-0 border-4 border-white rounded-full"
          animate={{ 
            rotate: [0, 360] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8,
            ease: "linear"
          }}
        >
          <motion.div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"
          />
        </motion.div>
        
        <motion.div
          className="absolute inset-4 flex items-center justify-center"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <Mail className="h-12 w-12 text-white" />
        </motion.div>
        
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-md" />
        </motion.div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
      >
        Teu Pai aquele ausente
      </motion.p>
      
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-center text-muted-foreground"
      >
        Carregando...
      </motion.p>
    </div>
  );
}
