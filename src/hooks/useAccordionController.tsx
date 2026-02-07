import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
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
 * Check if a section has meaningful (non-default) inputs by comparing to initial state.
 */
function hasMeaningfulInputs(
  currentInputs: CalculatorInputs,
  initialInputs: CalculatorInputs,
  sectionId: string
): boolean {
  switch (sectionId) {
    case 'position':
      return (
        currentInputs.positionTitle !== initialInputs.positionTitle ||
        currentInputs.hirePay.payType !== initialInputs.hirePay.payType ||
        currentInputs.hirePay.payAmount !== initialInputs.hirePay.payAmount
      );
    
    case 'roles': {
      const currHr = currentInputs.roles.hr;
      const initHr = initialInputs.roles.hr;
      const currMgr = currentInputs.roles.manager;
      const initMgr = initialInputs.roles.manager;
      const currTeam = currentInputs.roles.team;
      const initTeam = initialInputs.roles.team;
      return (
        currHr.enabled !== initHr.enabled ||
        currHr.payType !== initHr.payType ||
        currHr.payAmount !== initHr.payAmount ||
        currMgr.enabled !== initMgr.enabled ||
        currMgr.payType !== initMgr.payType ||
        currMgr.payAmount !== initMgr.payAmount ||
        currTeam.enabled !== initTeam.enabled ||
        currTeam.payType !== initTeam.payType ||
        currTeam.payAmount !== initTeam.payAmount
      );
    }
    
    case 'strategy':
      return (
        currentInputs.strategyPrep.hrHours !== initialInputs.strategyPrep.hrHours ||
        currentInputs.strategyPrep.managerHours !== initialInputs.strategyPrep.managerHours ||
        currentInputs.strategyPrep.teamHours !== initialInputs.strategyPrep.teamHours
      );
    
    case 'ads':
      return (
        currentInputs.adsBranding.hrHours !== initialInputs.adsBranding.hrHours ||
        currentInputs.adsBranding.managerHours !== initialInputs.adsBranding.managerHours ||
        currentInputs.adsBranding.teamHours !== initialInputs.adsBranding.teamHours ||
        currentInputs.adsBranding.directCosts !== initialInputs.adsBranding.directCosts
      );
    
    case 'candidate':
      return (
        currentInputs.candidateMgmt.hrHours !== initialInputs.candidateMgmt.hrHours ||
        currentInputs.candidateMgmt.managerHours !== initialInputs.candidateMgmt.managerHours ||
        currentInputs.candidateMgmt.teamHours !== initialInputs.candidateMgmt.teamHours ||
        currentInputs.candidateMgmt.testsCost !== initialInputs.candidateMgmt.testsCost
      );
    
    case 'interviews':
      return (
        currentInputs.interviews.hrHours !== initialInputs.interviews.hrHours ||
        currentInputs.interviews.managerHours !== initialInputs.interviews.managerHours ||
        currentInputs.interviews.teamHours !== initialInputs.interviews.teamHours ||
        currentInputs.interviews.directCosts !== initialInputs.interviews.directCosts
      );
    
    case 'background':
      return (
        currentInputs.backgroundOffer.hrHours !== initialInputs.backgroundOffer.hrHours ||
        currentInputs.backgroundOffer.managerHours !== initialInputs.backgroundOffer.managerHours ||
        currentInputs.backgroundOffer.teamHours !== initialInputs.backgroundOffer.teamHours ||
        currentInputs.backgroundOffer.directCosts !== initialInputs.backgroundOffer.directCosts
      );
    
    case 'other-services':
      return currentInputs.otherServices.length !== initialInputs.otherServices.length ||
        JSON.stringify(currentInputs.otherServices) !== JSON.stringify(initialInputs.otherServices);
    
    case 'preboarding':
      return (
        currentInputs.preboarding.devicesCost !== initialInputs.preboarding.devicesCost ||
        currentInputs.preboarding.itSetupHours !== initialInputs.preboarding.itSetupHours ||
        currentInputs.preboarding.prepHours !== initialInputs.preboarding.prepHours
      );
    
    case 'onboarding':
      return (
        currentInputs.onboarding.onboardingMonths !== initialInputs.onboarding.onboardingMonths ||
        currentInputs.onboarding.productivityPct !== initialInputs.onboarding.productivityPct ||
        currentInputs.onboarding.extraCosts !== initialInputs.onboarding.extraCosts
      );
    
    case 'vacancy':
      return (
        currentInputs.vacancy.vacancyDays !== initialInputs.vacancy.vacancyDays ||
        currentInputs.vacancy.dailyCost !== initialInputs.vacancy.dailyCost
      );
    
    case 'indirect':
      return (
        currentInputs.indirectCosts.hrHours !== initialInputs.indirectCosts.hrHours ||
        currentInputs.indirectCosts.managerHours !== initialInputs.indirectCosts.managerHours ||
        currentInputs.indirectCosts.teamHours !== initialInputs.indirectCosts.teamHours
      );
    
    case 'risk':
      // Risk section uses config values, not inputs - consider it completed if visited
      // since it has pre-filled defaults that users can review
      return true;
    
    default:
      return false;
  }
}

/**
 * Legacy check for any non-zero/non-empty inputs (used for hasNonZeroInputs).
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
      return true;
    
    default:
      return false;
  }
}

// ============================================================================
// ACCORDION CONTROLLER CONTEXT
// ============================================================================

interface AccordionControllerContextType {
  openSection: string | null;
  setOpenSection: (sectionId: string | null) => void;
  getSectionState: (sectionId: string) => SectionState;
  hasNonZeroInputs: (sectionId: string) => boolean;
  isVisited: (sectionId: string) => boolean;
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
  const [openSection, setOpenSectionState] = useState<string | null>(defaultOpenSection);
  const [visitedSections, setVisitedSections] = useState<Set<string>>(
    () => new Set(defaultOpenSection ? [defaultOpenSection] : [])
  );
  const { inputs } = useAppStore();
  
  // Store initial inputs snapshot on first render
  const initialInputsRef = useRef<CalculatorInputs | null>(null);
  if (initialInputsRef.current === null) {
    initialInputsRef.current = JSON.parse(JSON.stringify(inputs));
  }

  const setOpenSection = useCallback((sectionId: string | null) => {
    setOpenSectionState(sectionId);
    if (sectionId !== null) {
      setVisitedSections((prev) => {
        if (prev.has(sectionId)) return prev;
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });
    }
  }, []);

  const isVisited = useCallback(
    (sectionId: string): boolean => {
      return visitedSections.has(sectionId);
    },
    [visitedSections]
  );

  const getSectionStateCallback = useCallback(
    (sectionId: string): SectionState => {
      const visited = visitedSections.has(sectionId);
      
      // Not visited → always "not-started"
      if (!visited) {
        return 'not-started';
      }
      
      // Visited → mark as completed (reviewed)
      // User opening a section counts as reviewing it
      return 'completed';
    },
    [visitedSections]
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
        isVisited,
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
