import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BLOCK_LABELS } from '@/config/defaults';
import { PRINT_SNAPSHOT_KEY } from './Index';
import type { CalculatorInputs, ComputedResult, BlockName } from '@/types/calculator';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface PrintConfig {
  disclaimerText: string;
  riskExplanationText: string;
  indirectExplanationText: string;
  finalQuestionText: string;
  ctaPlaceholderText: string;
  BAD_HIRE_RISK_RATE: number;
  BAD_HIRE_PAY_MONTHS: number;
  HOURS_PER_MONTH: number;
  EST_AVG_GROSS_WAGE: number;
}

interface PrintSnapshot {
  inputs: CalculatorInputs;
  results: ComputedResult;
  config: PrintConfig;
  generatedAt: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('et-EE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('et-EE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPayTypeLabel = (payType: string) => {
  switch (payType) {
    case 'monthly': return 'Kuupalk';
    case 'hourly': return 'Tunnipalk';
    default: return 'Määramata';
  }
};

const CHART_COLORS = [
  'hsl(217, 91%, 30%)',
  'hsl(217, 91%, 40%)',
  'hsl(217, 91%, 50%)',
  'hsl(217, 71%, 53%)',
  'hsl(210, 60%, 60%)',
  'hsl(200, 50%, 65%)',
  'hsl(190, 45%, 70%)',
  'hsl(180, 40%, 75%)',
  'hsl(170, 35%, 80%)',
  'hsl(160, 30%, 85%)',
  'hsl(150, 25%, 88%)',
];

// ============================================================================
// PRINT CHART (simplified for print)
// ============================================================================

function PrintChart({ results }: { results: ComputedResult }) {
  const blockOrder: BlockName[] = [
    'strategyPrep', 'adsBranding', 'candidateMgmt', 'interviews',
    'backgroundOffer', 'otherServices', 'preboarding', 'onboarding',
    'vacancy', 'indirectCosts', 'expectedRisk'
  ];

  const chartData = blockOrder
    .filter(key => results.blockCosts[key].total > 0)
    .map((key, index) => ({
      name: BLOCK_LABELS[key] || key,
      value: results.blockCosts[key].total,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="flex items-start gap-6">
      <div className="w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={70}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MISSING SNAPSHOT VIEW
// ============================================================================

function MissingSnapshot() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Puudub arvutuse snapshot</h1>
        <p className="text-gray-600 mb-6">
          Mine tagasi kalkulaatorisse ja klõpsa "Prindi aruanne (PDF)" nuppu.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          ← Tagasi kalkulaatorisse
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PRINT COMPONENT
// ============================================================================

const Print = () => {
  const [snapshot, setSnapshot] = useState<PrintSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(PRINT_SNAPSHOT_KEY);
    if (stored) {
      try {
        setSnapshot(JSON.parse(stored));
      } catch {
        setSnapshot(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Laadimine...</div>;
  }

  if (!snapshot) {
    return <MissingSnapshot />;
  }

  const { inputs, results, config, generatedAt } = snapshot;

  // Prepare block cost lines for breakdown table
  const blockCostLines = [
    { key: 'strategyPrep', label: BLOCK_LABELS.strategyPrep, value: results.blockCosts.strategyPrep.total },
    { key: 'adsBranding', label: BLOCK_LABELS.adsBranding, value: results.blockCosts.adsBranding.total },
    { key: 'candidateMgmt', label: BLOCK_LABELS.candidateMgmt, value: results.blockCosts.candidateMgmt.total },
    { key: 'interviews', label: BLOCK_LABELS.interviews, value: results.blockCosts.interviews.total },
    { key: 'backgroundOffer', label: BLOCK_LABELS.backgroundOffer, value: results.blockCosts.backgroundOffer.total },
    { key: 'otherServices', label: BLOCK_LABELS.otherServices, value: results.blockCosts.otherServices.total },
    { key: 'preboarding', label: BLOCK_LABELS.preboarding, value: results.blockCosts.preboarding.total },
    { key: 'onboarding', label: BLOCK_LABELS.onboarding, value: results.blockCosts.onboarding.total },
    { key: 'vacancy', label: BLOCK_LABELS.vacancy, value: results.blockCosts.vacancy.total },
    { key: 'indirectCosts', label: BLOCK_LABELS.indirectCosts, value: results.blockCosts.indirectCosts.total },
  ].filter(item => item.value > 0);

  // Repeated services
  const repeatedServices = inputs.otherServices.filter(s => s.repeatOnBadHire);

  return (
    <div className="print-page min-h-screen bg-white text-black">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="print-header px-8 pt-8 pb-4 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Placeholder for Manpower logo */}
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold">Värbamisprotsessi tegeliku kogukulu aruanne</h1>
              <p className="text-sm text-gray-600">Genereeritud: {formatDate(generatedAt)}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Ametikoht: <strong>{inputs.positionTitle || 'Määramata'}</strong></p>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* SUMMARY SECTION */}
      {/* ================================================================== */}
      <section className="print-section px-8 py-6 page-break-inside-avoid">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Kokkuvõte</h2>
        
        {/* Total Cost Highlight */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Värbamise kogukulu</p>
          <p className="text-4xl font-bold text-primary">{formatCurrency(results.totalCost)}</p>
          <p className="text-sm text-gray-500 mt-1">
            (sh oodatav riskikulu {formatCurrency(results.expectedRiskCost)})
          </p>
        </div>

        {/* Breakdown Table */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-2 text-sm text-gray-600">Kulude jaotus</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-medium">Kategooria</th>
                  <th className="text-right py-1 font-medium">€</th>
                  <th className="text-right py-1 font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {blockCostLines.map((line) => (
                  <tr key={line.key} className="border-b border-gray-100">
                    <td className="py-1">{line.label}</td>
                    <td className="py-1 text-right">{formatCurrency(line.value)}</td>
                    <td className="py-1 text-right text-gray-500">
                      {results.percentages[line.key as BlockName]?.toFixed(0) || 0}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 font-semibold">
                  <td className="py-2">Baaskulu</td>
                  <td className="py-2 text-right">{formatCurrency(results.baseCost)}</td>
                  <td className="py-2 text-right"></td>
                </tr>
                <tr className="text-gray-600">
                  <td className="py-1">+ Oodatav riskikulu</td>
                  <td className="py-1 text-right">{formatCurrency(results.expectedRiskCost)}</td>
                  <td className="py-1 text-right"></td>
                </tr>
                <tr className="border-t-2 border-black font-bold text-lg">
                  <td className="py-2">KOKKU</td>
                  <td className="py-2 text-right">{formatCurrency(results.totalCost)}</td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm text-gray-600">Visuaalne jaotus</h3>
            <PrintChart results={results} />
          </div>
        </div>

        {/* Top Drivers */}
        {results.topDrivers.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-sm text-gray-600">Top 3 kuluallikat</h3>
            <ol className="list-decimal list-inside space-y-1">
              {results.topDrivers.map((driver, idx) => (
                <li key={idx} className="text-sm">
                  <strong>{driver.label}</strong>
                  <span className="text-gray-600"> — {formatCurrency(driver.amount)} ({driver.percentage.toFixed(0)}%)</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* INPUTS SECTION */}
      {/* ================================================================== */}
      <section className="print-section px-8 py-6 page-break-before">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Sisendandmed</h2>

        {/* Position & Hire Pay */}
        <div className="mb-6 page-break-inside-avoid">
          <h3 className="font-medium text-sm text-gray-600 mb-2">Värvatud töötaja</h3>
          <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded">
            <div>
              <p className="text-gray-500">Ametikoht</p>
              <p className="font-medium">{inputs.positionTitle || 'Määramata'}</p>
            </div>
            <div>
              <p className="text-gray-500">Palgatüüp</p>
              <p className="font-medium">{getPayTypeLabel(inputs.hirePay.payType)}</p>
            </div>
            <div>
              <p className="text-gray-500">Brutopalk</p>
              <p className="font-medium">
                {inputs.hirePay.payType === 'hourly' 
                  ? `${inputs.hirePay.payAmount} €/h × ${inputs.hirePay.hoursPerMonth || config.HOURS_PER_MONTH}h`
                  : `${formatCurrency(results.normalizedHirePay.monthlyGross)}/kuu`
                }
                {results.defaultsUsed.hirePay && <span className="text-orange-600 ml-1">*</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tööandja kogukulu</p>
              <p className="font-medium">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}/kuu</p>
            </div>
          </div>
          {results.defaultsUsed.hirePay && (
            <p className="text-xs text-orange-600 mt-1">* Kasutatud Eesti keskmist brutopalk ({config.EST_AVG_GROSS_WAGE} €)</p>
          )}
        </div>

        {/* Roles */}
        <div className="mb-6 page-break-inside-avoid">
          <h3 className="font-medium text-sm text-gray-600 mb-2">Värbamisprotsessis osalejad</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {['hr', 'manager', 'team'].map((role) => {
              const roleData = inputs.roles[role as keyof typeof inputs.roles];
              const normalized = results.normalizedRoles[role as keyof typeof results.normalizedRoles];
              if (!roleData.enabled) return null;
              return (
                <div key={role} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium capitalize mb-1">
                    {role === 'hr' ? 'HR' : role === 'manager' ? 'Juht' : 'Meeskond'}
                  </p>
                  <p className="text-gray-600">{formatCurrency(normalized.employerHourlyRate)}/h (tööandja kulu)</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block Inputs */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Strategy & Prep */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.strategyPrep}</h4>
            <p>HR: {inputs.strategyPrep.hrHours}h, Juht: {inputs.strategyPrep.managerHours}h, Meeskond: {inputs.strategyPrep.teamHours}h</p>
          </div>

          {/* Ads */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.adsBranding}</h4>
            <p>Otsekulu: {formatCurrency(inputs.adsBranding.directCosts)}</p>
            <p>HR: {inputs.adsBranding.hrHours}h, Juht: {inputs.adsBranding.managerHours}h</p>
          </div>

          {/* Candidate Mgmt */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.candidateMgmt}</h4>
            <p>Testid: {formatCurrency(inputs.candidateMgmt.testsCost)}</p>
            <p>HR: {inputs.candidateMgmt.hrHours}h, Juht: {inputs.candidateMgmt.managerHours}h</p>
          </div>

          {/* Interviews */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.interviews}</h4>
            <p>Otsekulu: {formatCurrency(inputs.interviews.directCosts)}</p>
            <p>HR: {inputs.interviews.hrHours}h, Juht: {inputs.interviews.managerHours}h, Meeskond: {inputs.interviews.teamHours}h</p>
          </div>

          {/* Background */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.backgroundOffer}</h4>
            <p>Otsekulu: {formatCurrency(inputs.backgroundOffer.directCosts)}</p>
            <p>HR: {inputs.backgroundOffer.hrHours}h, Juht: {inputs.backgroundOffer.managerHours}h</p>
          </div>

          {/* Preboarding */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.preboarding}</h4>
            <p>Seadmed: {formatCurrency(inputs.preboarding.devicesCost)}</p>
            <p>IT seadistus: {inputs.preboarding.itSetupHours}h, Ettevalmistus: {inputs.preboarding.prepHours}h</p>
          </div>

          {/* Onboarding */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.onboarding}</h4>
            <p>Kestus: {inputs.onboarding.onboardingMonths} kuud @ {inputs.onboarding.productivityPct}% tootlikkus</p>
            <p>Lisakulud: {formatCurrency(inputs.onboarding.extraCosts)}</p>
          </div>

          {/* Vacancy */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.vacancy}</h4>
            <p>Vakantne: {inputs.vacancy.vacancyDays} päeva × {formatCurrency(inputs.vacancy.dailyCost)}/päev</p>
          </div>

          {/* Indirect */}
          <div className="page-break-inside-avoid bg-gray-50 p-3 rounded col-span-2">
            <h4 className="font-medium mb-2">{BLOCK_LABELS.indirectCosts}</h4>
            <p>HR: {inputs.indirectCosts.hrHours}h, Juht: {inputs.indirectCosts.managerHours}h, Meeskond: {inputs.indirectCosts.teamHours}h</p>
            <p className="text-xs text-gray-500 mt-1">{config.indirectExplanationText}</p>
          </div>
        </div>

        {/* Other Services */}
        {inputs.otherServices.length > 0 && (
          <div className="mt-6 page-break-inside-avoid">
            <h3 className="font-medium text-sm text-gray-600 mb-2">{BLOCK_LABELS.otherServices}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-1">Teenus</th>
                  <th className="py-1">Tüüp</th>
                  <th className="py-1 text-right">Hind/Info</th>
                  <th className="py-1 text-right">Tunnid</th>
                  <th className="py-1 text-center">Kordub?</th>
                </tr>
              </thead>
              <tbody>
                {inputs.otherServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-100">
                    <td className="py-1">{service.name || 'Nimeta'}</td>
                    <td className="py-1">
                      {service.details.serviceType === 'inhouse' ? 'Sisemajanduslik' : 'Väline'}
                    </td>
                    <td className="py-1 text-right">
                      {service.details.serviceType === 'outsourced' 
                        ? `${formatCurrency(service.details.price)} (${service.details.billingType})`
                        : `${service.details.payAmount} €/${service.details.payType === 'hourly' ? 'h' : 'kuu'}`
                      }
                    </td>
                    <td className="py-1 text-right">{service.serviceHours}h</td>
                    <td className="py-1 text-center">{service.repeatOnBadHire ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* RISK SECTION */}
      {/* ================================================================== */}
      <section className="print-section px-8 py-6 page-break-before">
        <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Riskianalüüs</h2>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-4">{config.riskExplanationText}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Riskimäär</p>
              <p className="text-2xl font-bold">{(config.BAD_HIRE_RISK_RATE * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Halva värbamise kulu (kuudes)</p>
              <p className="text-2xl font-bold">{config.BAD_HIRE_PAY_MONTHS} kuud</p>
            </div>
          </div>
        </div>

        {/* Repeated Services */}
        {repeatedServices.length > 0 && (
          <div className="mb-4 page-break-inside-avoid">
            <h3 className="font-medium text-sm mb-2">Korduvad teenused halva värbamise korral:</h3>
            <ul className="list-disc list-inside text-sm">
              {repeatedServices.map((s) => (
                <li key={s.id}>{s.name || 'Nimeta teenus'}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Kui värbamine ebaõnnestub</p>
            <p className="text-2xl font-bold text-red-700">+{formatCurrency(results.badHireExtraIfHappens)}</p>
            <p className="text-xs text-gray-500">lisandub põhikulule</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Oodatav riskikulu ({(config.BAD_HIRE_RISK_RATE * 100).toFixed(0)}%)</p>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(results.expectedRiskCost)}</p>
            <p className="text-xs text-gray-500">arvestatud kogukulusse</p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* INTERPRETATION & CTA */}
      {/* ================================================================== */}
      <section className="print-section px-8 py-6 page-break-inside-avoid">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">{config.finalQuestionText}</h2>
          <p className="text-gray-600 mb-4">{config.ctaPlaceholderText}</p>
          <div className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium">
            Võta ühendust →
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER DISCLAIMER */}
      {/* ================================================================== */}
      <footer className="print-footer px-8 py-4 border-t border-gray-200 text-xs text-gray-500">
        <p>{config.disclaimerText}</p>
        <p className="mt-2">Aruanne genereeritud: {formatDate(generatedAt)}</p>
      </footer>

      {/* ================================================================== */}
      {/* PRINT BUTTON (hidden in print) */}
      {/* ================================================================== */}
      <div className="no-print fixed bottom-6 right-6 flex gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Tagasi
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Prindi / Salvesta PDF
        </button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-page {
            padding: 0;
            margin: 0;
          }
          
          .print-section {
            break-inside: avoid;
          }
          
          .page-break-before {
            break-before: page;
          }
          
          .page-break-inside-avoid {
            break-inside: avoid;
          }
          
          table tr {
            break-inside: avoid;
          }
          
          /* Minimal backgrounds for print */
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          .bg-orange-50 {
            background-color: #fff7ed !important;
          }
          
          .bg-red-50 {
            background-color: #fef2f2 !important;
          }
          
          .bg-yellow-50 {
            background-color: #fefce8 !important;
          }
          
          /* Header on every page */
          .print-header {
            position: running(header);
          }
          
          @page {
            margin: 1.5cm;
            @top-center {
              content: element(header);
            }
          }
        }
        
        @media screen {
          .print-page {
            max-width: 800px;
            margin: 0 auto;
            padding-bottom: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Print;
