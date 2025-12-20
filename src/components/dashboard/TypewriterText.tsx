import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

const TypewriterText = ({ text, delay = 0, speed = 50, className = '' }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startTyping = () => {
      let currentIndex = 0;
      
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
        }
      };
      
      typeNextChar();
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(timeout);
    };
  }, [text, delay, speed]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-[1em] bg-primary ml-1 align-middle"
        />
      )}
    </span>
  );
};

export default TypewriterText;
