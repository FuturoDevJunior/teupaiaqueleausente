import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Terminal,
} from 'lucide-react';

import EasterEgg from '@/components/EasterEgg';
import { useTheme } from '@/components/theme/theme-provider';

export default function AppFooter() {
  const { theme } = useTheme();
  
  return (
    <footer className="bg-card border-t py-6 relative z-10">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Teu Pai aquele ausente</span> © {new Date().getFullYear()} - Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground/70">
              100% Open Source - Email temporário para quando você precisar como seu pai precisou sair.
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <motion.a
                href="https://github.com/DevFerreiraG/super-email-brazil"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/10 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/10 transition-all">
                  <Terminal className="h-4 w-4 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
                  <span className="font-mono font-medium group-hover:text-indigo-500 transition-colors">&lt;DevFerreiraG /&gt;</span>
                </div>
              </motion.a>

              <motion.a 
                href="https://linkedin.com/in/DevFerreiraG"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 8px rgba(131, 94, 251, 0.6)"
                }}
                className="flex items-center justify-center h-8 w-8 rounded-md bg-black/10 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/10 transition-all"
              >
                <Linkedin className="h-4 w-4 text-indigo-500 hover:text-indigo-400 transition-colors" />
              </motion.a>
              
              <motion.a 
                href="https://github.com/DevFerreiraG"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 8px rgba(131, 94, 251, 0.6)"
                }}
                className="flex items-center justify-center h-8 w-8 rounded-md bg-black/10 dark:bg-white/5 hover:bg-black/15 dark:hover:bg-white/10 transition-all"
              >
                <Github className="h-4 w-4 text-indigo-500 hover:text-indigo-400 transition-colors" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
      <EasterEgg />
    </footer>
  );
}
