import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAppStore } from '@/store/appStore';
import type { CalculatorInputs } from '@/types/calculator';

// ============================================================================
// SECTION STATE TYPES
// ============================================================================

export type SectionState = 'not-started' | 'in-progress' | 'completed';

export interface SectionStateInfo {
  state: SectionState;
  hasNonZeroInputs: boolean;
}

// ============================================================================
// SECTION STATE LOGIC
// ============================================================================

/**
 * Determine if a block has any non-zero/non-empty inputs.
 */
function hasBlockInputs(inputs: CalculatorInputs, sectionId: string): boolean {
  switch (sectionId) {
    case 'position':
      return (
        inputs.positionTitle.trim() !== '' ||
        inputs.hirePay.payType !== 'unset' ||
        inputs.hirePay.payAmount > 0
      );
    
    case 'roles':
      const hr = inputs.roles.hr;
      const mgr = inputs.roles.manager;
      const team = inputs.roles.team;
      return (
        (hr.enabled && (hr.payType !== 'unset' || hr.payAmount > 0)) ||
        (mgr.enabled && (mgr.payType !== 'unset' || mgr.payAmount > 0)) ||
        (team.enabled && (team.payType !== 'unset' || team.payAmount > 0))
      );
    
    case 'strategy':
      return (
        inputs.strategyPrep.hrHours > 0 ||
        inputs.strategyPrep.managerHours > 0 ||
        inputs.strategyPrep.teamHours > 0
      );
    
    case 'ads':
      return (
        inputs.adsBranding.hrHours > 0 ||
        inputs.adsBranding.managerHours > 0 ||
        inputs.adsBranding.teamHours > 0 ||
        inputs.adsBranding.directCosts > 0
      );
    
    case 'candidate':
      return (
        inputs.candidateMgmt.hrHours > 0 ||
        inputs.candidateMgmt.managerHours > 0 ||
        inputs.candidateMgmt.teamHours > 0 ||
        inputs.candidateMgmt.testsCost > 0
      );
    
    case 'interviews':
      return (
        inputs.interviews.hrHours > 0 ||
        inputs.interviews.managerHours > 0 ||
        inputs.interviews.teamHours > 0 ||
        inputs.interviews.directCosts > 0
      );
    
    case 'background':
      return (
        inputs.backgroundOffer.hrHours > 0 ||
        inputs.backgroundOffer.managerHours > 0 ||
        inputs.backgroundOffer.teamHours > 0 ||
        inputs.backgroundOffer.directCosts > 0
      );
    
    case 'other-services':
      return inputs.otherServices.length > 0;
    
    case 'preboarding':
      return (
        inputs.preboarding.devicesCost > 0 ||
        inputs.preboarding.itSetupHours > 0 ||
        inputs.preboarding.prepHours > 0
      );
    
    case 'onboarding':
      return (
        inputs.onboarding.onboardingMonths > 0 ||
        inputs.onboarding.productivityPct > 0 ||
        inputs.onboarding.extraCosts > 0
      );
    
    case 'vacancy':
      return inputs.vacancy.vacancyDays > 0 || inputs.vacancy.dailyCost > 0;
    
    case 'indirect':
      return (
        inputs.indirectCosts.hrHours > 0 ||
        inputs.indirectCosts.managerHours > 0 ||
        inputs.indirectCosts.teamHours > 0
      );
    
    case 'risk':
      return true; // Risk section is always considered started since it has defaults
    
    default:
      return false;
  }
}

/**
 * Determine section state based on inputs.
 * - not-started: all values are 0/empty/default
 * - in-progress: some values set but section may be incomplete
 * - completed: has meaningful inputs (simplified - we just check for any inputs)
 */
function getSectionState(inputs: CalculatorInputs, sectionId: string): SectionState {
  const hasInputs = hasBlockInputs(inputs, sectionId);
  
  if (!hasInputs) {
    return 'not-started';
  }
  
  // For now, any section with inputs is considered completed
  // More sophisticated logic could check for "required" fields
  return 'completed';
}

// ============================================================================
// ACCORDION CONTROLLER CONTEXT
// ============================================================================

interface AccordionControllerContextType {
  openSection: string | null;
  setOpenSection: (sectionId: string | null) => void;
  getSectionState: (sectionId: string) => SectionState;
  hasNonZeroInputs: (sectionId: string) => boolean;
}

const AccordionControllerContext = createContext<AccordionControllerContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AccordionControllerProviderProps {
  children: ReactNode;
  defaultOpenSection?: string;
}

export function AccordionControllerProvider({
  children,
  defaultOpenSection = 'position',
}: AccordionControllerProviderProps) {
  const [openSection, setOpenSection] = useState<string | null>(defaultOpenSection);
  const { inputs } = useAppStore();

  const getSectionStateCallback = useCallback(
    (sectionId: string): SectionState => {
      return getSectionState(inputs, sectionId);
    },
    [inputs]
  );

  const hasNonZeroInputsCallback = useCallback(
    (sectionId: string): boolean => {
      return hasBlockInputs(inputs, sectionId);
    },
    [inputs]
  );

  return (
    <AccordionControllerContext.Provider
      value={{
        openSection,
        setOpenSection,
        getSectionState: getSectionStateCallback,
        hasNonZeroInputs: hasNonZeroInputsCallback,
      }}
    >
      {children}
    </AccordionControllerContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAccordionController() {
  const context = useContext(AccordionControllerContext);
  if (!context) {
    throw new Error(
      'useAccordionController must be used within an AccordionControllerProvider'
    );
  }
  return context;
}
