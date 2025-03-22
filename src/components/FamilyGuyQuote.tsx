
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { quotes } from "@/data/familyGuyQuotes";

export default function FamilyGuyQuote() {
  const [quote, setQuote] = useState("");
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
      setKey(prev => prev + 1);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
      className="italic text-sm text-primary/80 dark:text-indigo-400/80 font-medium mt-1 px-3 py-2 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg max-w-md mx-auto"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        "{quote}"
      </motion.span>
    </motion.div>
  );
}
