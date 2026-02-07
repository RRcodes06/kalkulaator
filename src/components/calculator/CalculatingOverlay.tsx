import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CalculatingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const messages = [
  'Arvutame…',
  'Koostame kokkuvõtet…',
];

export function CalculatingOverlay({ isVisible, onComplete }: CalculatingOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    // Change message after 1.5s
    const messageTimer = setTimeout(() => {
      setMessageIndex(1);
    }, 1500);

    // Complete after 2.5-3s total
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-2xl border border-border">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
}
