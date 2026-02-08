import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Check, Circle, HelpCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccordionController, type SectionState } from '@/hooks/useAccordionController';
import { useAppStore } from '@/store/appStore';
import { SECTION_INFO } from '@/config/sectionInfo';

interface CalculatorSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  subtotal?: number;
  infoKey?: string; // key to look up in SECTION_INFO
  hideInfoButton?: boolean; // hide the ? info button
}

function StateIndicator({ state }: { state: SectionState }) {
  switch (state) {
    case 'completed':
      return (
        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-success" />
        </div>
      );
    case 'in-progress':
      return (
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <Circle className="w-2 h-2 fill-primary text-primary" />
        </div>
      );
    case 'not-started':
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
          <Circle className="w-2 h-2 text-muted-foreground" />
        </div>
      );
  }
}

function SectionInfoBox({ infoKey, onClose }: { infoKey: string; onClose: () => void }) {
  const info = SECTION_INFO[infoKey];
  if (!info) return null;

  return (
    <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-foreground">{info.description}</p>
          <p className="text-xs text-muted-foreground">{info.guidance}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Sulge info"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

export function CalculatorSection({
  id,
  title,
  icon,
  children,
  subtotal,
  infoKey,
  hideInfoButton,
}: CalculatorSectionProps) {
  const { openSection, setOpenSection, getSectionState } = useAccordionController();
  const { hasCalculated } = useAppStore();
  const sectionState = getSectionState(id);
  const [showInfo, setShowInfo] = useState(false);
  
  // Use provided infoKey or derive from id
  const resolvedInfoKey = infoKey || id;
  const hasInfo = Boolean(SECTION_INFO[resolvedInfoKey]) && !hideInfoButton;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleValueChange = (value: string) => {
    setOpenSection(value === id ? id : value === '' ? null : value);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openSection === id ? id : ''}
      onValueChange={handleValueChange}
      className="animate-fade-in"
    >
      <AccordionItem value={id} className="border-0">
        <div className={cn(
          "bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all",
          sectionState === 'completed' && "ring-1 ring-success/20",
          sectionState === 'in-progress' && "ring-1 ring-primary/20"
        )}>
          <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-lg flex items-center justify-center transition-colors",
                  sectionState === 'completed' && "bg-success/10 text-success",
                  sectionState === 'in-progress' && "bg-primary/10 text-primary",
                  sectionState === 'not-started' && "bg-muted text-muted-foreground"
                )}>
                  {icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground">{title}</h3>
                    <StateIndicator state={sectionState} />
                    {hasInfo && (
                      <button
                        onClick={handleInfoClick}
                        className={cn(
                          "p-0.5 rounded-full transition-colors",
                          showInfo 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        aria-label="Näita infot"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {subtotal !== undefined && subtotal > 0 && hasCalculated && (
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(subtotal)}
                </span>
              )}
              {subtotal !== undefined && subtotal > 0 && !hasCalculated && (
                <span className="text-lg font-semibold text-muted-foreground">
                  —
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-8 pt-4">
            {showInfo && hasInfo && (
              <SectionInfoBox 
                infoKey={resolvedInfoKey} 
                onClose={() => setShowInfo(false)} 
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children}
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
