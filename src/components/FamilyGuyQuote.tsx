import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import { quotes } from '@/data/familyGuyQuotes';

export default function FamilyGuyQuote() {
  const [quote, setQuote] = useState("");
  const [key, setKey] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousIndicesRef = useRef<number[]>([]);
  
  // Prioritize quotes with character dialogue and acidic content
  const scoredQuotes = useMemo(() => {
    return quotes.map((quote, index) => {
      let score = 0;
      
      // Prioritize quotes with character prefixes
      if (/^[A-Za-z\s]+:/.test(quote)) {
        score += 3;
      }
      
      // Prioritize quotes with more acidic content
      const acidicKeywords = ['shut up', 'giggity', 'trap', 'pensão', 'culpa', 'abandonar', 
                             'trauma', 'fugir', 'cerveja', 'negação', 'desaparecer'];
      
      acidicKeywords.forEach(keyword => {
        if (quote.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        }
      });
      
      // Prioritize quotes that are an optimal length (not too short, not too long)
      const idealLength = 80;
      const lengthDiff = Math.abs(quote.length - idealLength);
      score += Math.max(0, 5 - Math.floor(lengthDiff / 20));
      
      return { quote, index, score };
    });
  }, []);
  
  // Get a random quote that hasn't been shown recently, prioritizing higher-scored quotes
  const getRandomQuote = useCallback(() => {
    if (!quotes.length) return { quote: "", index: -1 };
    
    // Keep track of recently used quotes to avoid repetition
    const recentLimit = Math.min(10, Math.floor(quotes.length / 3));
    const previousIndices = previousIndicesRef.current;
    
    // Filter out recently used quotes
    const availableQuotes = scoredQuotes.filter(q => 
      !previousIndices.includes(q.index) || previousIndices.length >= quotes.length - 1
    );
    
    // If no available quotes or all scores are 0, return a default quote
    if (availableQuotes.length === 0 || 
        availableQuotes.reduce((sum, q) => sum + q.score, 0) === 0) {
      // Return first quote as fallback if no quotes available
      previousIndicesRef.current = [];
      return { 
        quote: quotes.length > 0 ? quotes[0] : "Shut up, Meg.", 
        index: 0 
      };
    }
    
    // Select a quote with weighted probability based on score
    const totalScore = availableQuotes.reduce((sum, q) => sum + q.score, 0);
    let targetValue = Math.random() * totalScore;
    let selectedQuote = availableQuotes[0]; // Fallback
    
    for (const quoteDef of availableQuotes) {
      targetValue -= quoteDef.score;
      if (targetValue <= 0) {
        selectedQuote = quoteDef;
        break;
      }
    }
    
    // If we didn't find a quote, pick a random one
    if (!selectedQuote && availableQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      selectedQuote = availableQuotes[randomIndex];
    }
    
    // Update previous indices ref
    const updated = [...previousIndices, selectedQuote.index];
    previousIndicesRef.current = updated.length > recentLimit 
      ? updated.slice(updated.length - recentLimit) 
      : updated;
    
    return {
      quote: selectedQuote.quote,
      index: selectedQuote.index
    };
  }, [scoredQuotes]);
  
  // Function to change the quote
  const changeQuote = useCallback(() => {
    if (isChanging) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsChanging(true);
    const result = getRandomQuote();
    setQuote(result.quote);
    setKey(prev => prev + 1);
    
    // Reset changing state after animation completes
    timerRef.current = setTimeout(() => {
      setIsChanging(false);
      timerRef.current = null;
    }, 500);
  }, [getRandomQuote, isChanging]);
  
  // Set initial quote on mount only
  useEffect(() => {
    try {
      const result = getRandomQuote();
      setQuote(result.quote);
      setKey(0);
    } catch (error) {
      console.error("Error setting initial quote:", error);
      setQuote("Error loading quotes. Meg probably broke something again.");
    }
    // Only run this effect once on mount
  }, [getRandomQuote]);
  
  // Set interval to change quote
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (!isChanging) {
          // Instead of calling changeQuote directly, perform the same actions
          // to avoid dependency cycle
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          
          setIsChanging(true);
          const result = getRandomQuote();
          setQuote(result.quote);
          setKey(prevKey => prevKey + 1);
          
          // Reset changing state after animation completes
          timerRef.current = setTimeout(() => {
            setIsChanging(false);
            timerRef.current = null;
          }, 500);
        }
      } catch (error) {
        console.error("Error updating quote:", error);
      }
    }, 10000); // 10 seconds for better readability
    
    return () => clearInterval(interval);
  }, [getRandomQuote, isChanging]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Cleanup the timeout when component unmounts
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Function to format the quote by styling character names
  const formatQuote = useMemo(() => (text: string) => {
    if (!text) return "";
    
    // If the quote starts with a character name pattern (Name: 'quote')
    if (/^[A-Za-z\s]+:/.test(text)) {
      const parts = text.split(/:(.*)/s);
      if (parts.length >= 2) {
        return (
          <>
            <span className="font-bold text-primary-600 dark:text-primary-400">{parts[0]}:</span>
            <span className="pl-1">{parts[1]}</span>
          </>
        );
      }
    }
    
    // Return the quote as is if no character pattern is found
    return `"${text}"`;
  }, []);
  
  // Determine if the quote is particularly long
  const isLongQuote = useMemo(() => quote.length > 100, [quote]);
  
  // Determine if the quote is from a character (has character prefix)
  const isCharacterQuote = useMemo(() => /^[A-Za-z\s]+:/.test(quote), [quote]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        onClick={changeQuote}
        className={`
          italic ${isLongQuote ? 'text-xs md:text-sm' : 'text-sm md:text-base'} 
          text-primary/80 dark:text-indigo-400/80 
          font-medium mt-1 px-4 py-3 
          ${isCharacterQuote 
            ? 'bg-indigo-100/60 dark:bg-indigo-800/30 border-l-2 border-primary-500' 
            : 'bg-indigo-50/50 dark:bg-indigo-900/20'
          } 
          rounded-lg max-w-md mx-auto 
          shadow-sm hover:shadow-md
          cursor-pointer select-none
          transition-all duration-300 ease-in-out
          hover:scale-[1.02] active:scale-[0.98]
        `}
        aria-label="Click for another Family Guy quote"
        title="Click for another quote"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="relative"
        >
          {formatQuote(quote)}
          <div className="absolute -bottom-1.5 -right-1 text-xs text-indigo-400/60 dark:text-indigo-300/40">
            — Family Guy
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
