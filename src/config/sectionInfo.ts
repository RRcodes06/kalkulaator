// Section info content for info boxes
// Keep short, neutral, explanatory - 1-2 sentences max

export const SECTION_INFO: Record<string, { description: string; guidance: string }> = {
  position: {
    description: 'Värbatava positsiooni põhiandmed ja palgaootused.',
    guidance: 'Sisesta brutopalk või tunnitasu, et saada täpne kuluarvestus.',
  },
  roles: {
    description: 'Värbamisprotsessis osalejate palgamäärad.',
    guidance: 'Kui jätad tühjaks, kasutatakse Eesti keskmist palka.',
  },
  strategy: {
    description: 'Siia kuulub rolli defineerimine ja nõuete paika panemine.',
    guidance: 'Mõtle, kui palju aega kulub enne kuulutamise alustamist.',
  },
  ads: {
    description: 'Kulud töökuulutustele ja tööandja nähtavusele.',
    guidance: 'Mõtle kasutatavatele kanalitele ja kampaania kestusele.',
  },
  candidate: {
    description: 'Aeg ja kulud CV-de läbivaatuseks, testimiseks ja suhtluseks kandidaatidega.',
    guidance: 'Arvesta kõigi kandidaatidega tehtava tööga, mitte ainult finalistidega.',
  },
  interviews: {
    description: 'Intervjuude läbiviimisele kuluv aeg ja otsesed kulud.',
    guidance: 'Arvesta juhtide ja tiimi kaasamisega igas intervjuuvoorus.',
  },
  background: {
    description: 'Lepingud, taustakontroll ja pakkumise vormistamine.',
    guidance: 'Sageli alahinnatud, kuid vältimatu etapp.',
  },
  preboarding: {
    description: 'Ettevalmistused enne töö algust (nt seadmed, ligipääsud).',
    guidance: 'Mõtle, mis tuleb teha enne esimest tööpäeva.',
  },
  onboarding: {
    description: 'Periood, kus töötaja tootlikkus on madalam, sest ta õpib rolle ja süsteeme.',
    guidance: 'Keerukamad rollid nõuavad pikemat sisseelamisaega.',
  },
  vacancy: {
    description: 'Mõju, kui roll on täitmata ja töö jääb tegemata või jaotub teistele.',
    guidance: 'Hinda, kui palju päevas kaotad, kui koht on täitmata.',
  },
  indirect: {
    description: 'Fookuse kadu ja lisatöö, mis ei kajastu otsestes arvetes.',
    guidance: 'Tiimi ülekoormus, juhi tähelepanu hajumine, prioriteetide ümberjagamine.',
  },
  other: {
    description: 'Välised või sisemised teenused, mida kasutatakse värbamisprotsessis.',
    guidance: 'Näiteks jurist, IT, värbamisagentuur, taustauuringute pakkuja.',
  },
  risk: {
    description: 'Statistiline tõenäosus, et värbamine ebaõnnestub.',
    guidance: 'Hõlmab lisakulusid, kui töötaja lahkub katseajal.',
  },
};

// Block metadata for dynamic insights
export interface BlockMetadata {
  key: string;
  isTimeBased: boolean; // true if costs primarily come from hours
  isCostBased: boolean; // true if costs primarily come from direct € spend
}

export const BLOCK_METADATA: Record<string, BlockMetadata> = {
  strategyPrep: { key: 'strategyPrep', isTimeBased: true, isCostBased: false },
  adsBranding: { key: 'adsBranding', isTimeBased: true, isCostBased: true },
  candidateMgmt: { key: 'candidateMgmt', isTimeBased: true, isCostBased: true },
  interviews: { key: 'interviews', isTimeBased: true, isCostBased: true },
  backgroundOffer: { key: 'backgroundOffer', isTimeBased: true, isCostBased: true },
  otherServices: { key: 'otherServices', isTimeBased: false, isCostBased: true },
  preboarding: { key: 'preboarding', isTimeBased: true, isCostBased: true },
  onboarding: { key: 'onboarding', isTimeBased: false, isCostBased: false }, // productivity loss
  vacancy: { key: 'vacancy', isTimeBased: false, isCostBased: false }, // opportunity cost
  indirectCosts: { key: 'indirectCosts', isTimeBased: true, isCostBased: false },
  expectedRisk: { key: 'expectedRisk', isTimeBased: false, isCostBased: false }, // probability-weighted
};

// Generate insight text for top cost drivers
export function getDriverInsight(blockKey: string, _blockCosts?: { timeCost: number; directCost: number }): string {
  const meta = BLOCK_METADATA[blockKey];
  
  const baseInsight = 'See on üks suurimaid kuluallikaid selles värbamisprotsessis.';
  
  if (!meta) return baseInsight;
  
  // Add context based on category type
  if (meta.isTimeBased && !meta.isCostBased) {
    return `${baseInsight} Peamine mõju tuleneb ajakulust ja osapoolte kaasamisest.`;
  }
  
  if (meta.isCostBased && !meta.isTimeBased) {
    return `${baseInsight} Kulu suurus sõltub valitud lahendustest ja teenuse mahust.`;
  }
  
  if (meta.isTimeBased && meta.isCostBased) {
    return `${baseInsight} Sisaldab nii ajakulu kui otseseid kulusid.`;
  }
  
  // Special cases
  if (blockKey === 'onboarding') {
    return `${baseInsight} Mõju tuleneb tootlikkuse kaost sisseelamisperioodil.`;
  }
  
  if (blockKey === 'vacancy') {
    return `${baseInsight} Täitmata positsioon mõjutab otseselt äri jõudlust.`;
  }
  
  if (blockKey === 'expectedRisk') {
    return `${baseInsight} See on riskiga kaalutud hinnang halva värbamise kulule.`;
  }
  
  return baseInsight;
}
