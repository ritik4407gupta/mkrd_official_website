import React from 'react';
import { motion } from 'motion/react';

interface SplitTextRevealProps {
  text: string;
  delay?: number;
  className?: string;
  staggerDuration?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({ 
  text, 
  delay = 0, 
  className = "",
  staggerDuration = 0.03,
  highlightWords = [],
  highlightClass = "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400"
}) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: staggerDuration, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", perspective: "1000px" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={className}
    >
      {words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, ''); // basic punctuation strip for match
        const isHighlight = highlightWords.some(hw => hw.toLowerCase() === cleanWord.toLowerCase() || hw.toLowerCase() === word.toLowerCase());
        
        return (
          <motion.span
            variants={child}
            style={{ marginRight: "0.25em", display: "inline-block", transformOrigin: "bottom" }}
            key={index}
            className={isHighlight ? highlightClass : ""}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
};
