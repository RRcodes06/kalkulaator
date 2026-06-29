import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Check, Circle, HelpCircle, X, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccordionController, type SectionState } from '@/hooks/useAccordionController';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';
import { Button } from '@/components/ui/button';

interface CalculatorSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  subtotal?: number;
  infoKey?: string;
  hideInfoButton?: boolean;
}

const SECTION_INFO_KEYS: Record<string, { desc: TranslationKey; guidance: TranslationKey }> = {
  position: { desc: 'sectionInfoPosition', guidance: 'sectionInfoPositionGuidance' },
  roles: { desc: 'sectionInfoRoles', guidance: 'sectionInfoRolesGuidance' },
  strategy: { desc: 'sectionInfoStrategy', guidance: 'sectionInfoStrategyGuidance' },
  ads: { desc: 'sectionInfoAds', guidance: 'sectionInfoAdsGuidance' },
  candidate: { desc: 'sectionInfoCandidate', guidance: 'sectionInfoCandidateGuidance' },
  interviews: { desc: 'sectionInfoInterviews', guidance: 'sectionInfoInterviewsGuidance' },
  background: { desc: 'sectionInfoBackground', guidance: 'sectionInfoBackgroundGuidance' },
  preboarding: { desc: 'sectionInfoPreboarding', guidance: 'sectionInfoPreboardingGuidance' },
  onboarding: { desc: 'sectionInfoOnboarding', guidance: 'sectionInfoOnboardingGuidance' },
  vacantImpact: { desc: 'sectionInfoVacantImpact', guidance: 'sectionInfoVacantImpactGuidance' },
  other: { desc: 'sectionInfoOther', guidance: 'sectionInfoOtherGuidance' },
  risk: { desc: 'sectionInfoRisk', guidance: 'sectionInfoRiskGuidance' },
};

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
  const { t } = useLanguage();
  const keys = SECTION_INFO_KEYS[infoKey];
  if (!keys) return null;

  return (
    <div className="mb-4 p-4 bg-muted/50 rounded-lg border border-border animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-foreground">{t(keys.desc)}</p>
          <p className="text-xs text-muted-foreground">{t(keys.guidance)}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
          aria-label={t('closeInfo')}
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

const FILLABLE_SECTIONS = new Set(['strategy', 'ads', 'candidate', 'interviews', 'background', 'onboarding', 'vacantImpact']);

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
  const { hasCalculated, fillSectionWithAverages } = useAppStore();
  const { t } = useLanguage();
  const sectionState = getSectionState(id);
  const resolvedInfoKey = infoKey || id;
  const hasInfo = Boolean(SECTION_INFO_KEYS[resolvedInfoKey]) && !hideInfoButton;
  const [showInfo, setShowInfo] = useState(hasInfo);
  
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
          <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
            <div className="flex items-center justify-between w-full pr-2 sm:pr-4 gap-2">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                  sectionState === 'completed' && "bg-success/10 text-success",
                  sectionState === 'in-progress' && "bg-primary/10 text-primary",
                  sectionState === 'not-started' && "bg-muted text-muted-foreground"
                )}>
                  {icon}
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-sm sm:text-base text-foreground">{title}</h2>
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
                        aria-label={t('showSectionInfo')}
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {subtotal !== undefined && subtotal > 0 && hasCalculated && (
                <span className="text-base sm:text-lg font-semibold text-primary flex-shrink-0 whitespace-nowrap">
                  {formatCurrency(subtotal)}
                </span>
              )}
              {subtotal !== undefined && subtotal > 0 && !hasCalculated && (
                <span className="text-base sm:text-lg font-semibold text-muted-foreground flex-shrink-0">
                  —
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6 pb-6 sm:pb-8 pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
              <div className="flex-1 w-full">
                {showInfo && hasInfo && (
                  <SectionInfoBox 
                    infoKey={resolvedInfoKey} 
                    onClose={() => setShowInfo(false)} 
                  />
                )}
              </div>
              {FILLABLE_SECTIONS.has(id) && (
                <Button
                  size="sm"
                  onClick={() => fillSectionWithAverages(id)}
                  className="gap-1.5 text-xs font-semibold flex-shrink-0 self-start md:self-auto md:ml-4 bg-amber-500 text-black hover:bg-amber-600 border-0 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('fillAverages')}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children}
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
