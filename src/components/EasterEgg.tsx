
import { useState } from "react";
import { motion } from "framer-motion";

export default function EasterEgg() {
  const [clicked, setClicked] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  const handleClick = () => {
    const newCount = clicked + 1;
    setClicked(newCount);
    
    if (newCount >= 5) {
      setShowEasterEgg(true);
      setTimeout(() => {
        setShowEasterEgg(false);
        setClicked(0);
      }, 3000);
    }
  };
  
  return (
    <>
      <div 
        onClick={handleClick} 
        className="absolute bottom-2 right-2 w-4 h-4 cursor-pointer"
        title="Clique várias vezes"
      />
      
      {showEasterEgg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          onClick={() => setShowEasterEgg(false)}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Easter Egg!</h3>
            <p className="mb-4">Você descobriu o Easter Egg do Family Guy!</p>
            <img 
              src="https://media1.giphy.com/media/8vtaU284eC6Xrpgg83/giphy.gif" 
              alt="Family Guy Easter Egg" 
              className="rounded-lg mx-auto w-full"
            />
          </div>
        </motion.div>
      )}
    </>
  );
}
