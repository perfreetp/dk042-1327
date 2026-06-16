import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryGuideProps {
  texts: string[];
  onComplete: () => void;
}

export default function StoryGuide({ texts, onComplete }: StoryGuideProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= texts.length) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setIndex((i) => i + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [index, texts.length, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <AnimatePresence mode="wait">
        {index < texts.length && (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, exit: { duration: 0.5 } }}
            className="text-2xl text-white/90 font-['Caveat'] text-center px-8 max-w-2xl leading-relaxed"
          >
            {texts[index]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
