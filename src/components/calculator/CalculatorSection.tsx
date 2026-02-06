import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccordionController, type SectionState } from '@/hooks/useAccordionController';

interface CalculatorSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  subtotal?: number;
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

export function CalculatorSection({
  id,
  title,
  subtitle,
  icon,
  children,
  subtotal,
}: CalculatorSectionProps) {
  const { openSection, setOpenSection, getSectionState } = useAccordionController();
  const sectionState = getSectionState(id);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleValueChange = (value: string) => {
    // If value is empty (accordion closing), allow it
    // If value matches our id (opening), set it
    setOpenSection(value === id ? id : value === '' ? null : value);
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
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  sectionState === 'completed' && "bg-success/10 text-success",
                  sectionState === 'in-progress' && "bg-primary/10 text-primary",
                  sectionState === 'not-started' && "bg-muted text-muted-foreground"
                )}>
                  {icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <StateIndicator state={sectionState} />
                  </div>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                  )}
                </div>
              </div>
              {subtotal !== undefined && subtotal > 0 && (
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(subtotal)}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
