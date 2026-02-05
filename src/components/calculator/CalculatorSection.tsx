import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CalculatorSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  subtotal?: number;
  defaultOpen?: boolean;
}

export function CalculatorSection({
  id,
  title,
  subtitle,
  icon,
  children,
  subtotal,
  defaultOpen = true,
}: CalculatorSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className="animate-fade-in"
    >
      <AccordionItem value={id} className="border-0">
        <div className="bg-card rounded-lg shadow-card hover:shadow-card-hover transition-shadow">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{title}</h3>
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
