import { useAppStore } from '@/store/appStore';
import { useEffect } from 'react';
import { BLOCK_LABELS } from '@/config/defaults';

const Print = () => {
  const { inputs, results, config } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  useEffect(() => {
    // Auto-print when page loads (optional)
    // window.print();
  }, []);

  const blockCostLines = [
    { label: 'Strateegia ja ettevalmistus', value: results.blockCosts.strategyPrep.total },
    { label: 'Kuulutused ja bränding', value: results.blockCosts.adsBranding.total },
    { label: 'Kandidaatide haldus ja testid', value: results.blockCosts.candidateMgmt.total },
    { label: 'Intervjuud', value: results.blockCosts.interviews.total },
    { label: 'Taustakontroll ja pakkumine', value: results.blockCosts.backgroundOffer.total },
    { label: 'Muud teenused', value: results.blockCosts.otherServices.total },
    { label: 'Ettevalmistus enne alustamist', value: results.blockCosts.preboarding.total },
    { label: 'Sisseelamine', value: results.blockCosts.onboarding.total },
    { label: 'Vaba ametikoha kulu', value: results.blockCosts.vacancy.total },
    { label: 'Kaudsed kulud', value: results.blockCosts.indirectCosts.total },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-3xl mx-auto print:p-0">
      {/* Header */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">Värbamiskulude aruanne</h1>
        <p className="text-sm text-gray-600 mt-1">
          Genereeritud: {new Date().toLocaleDateString('et-EE')}
        </p>
      </header>

      {/* Position Summary */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1">Ametikoha andmed</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Ametikoht</p>
            <p className="font-medium">{inputs.positionTitle || 'Määramata'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Brutopalk</p>
            <p className="font-medium">{formatCurrency(results.normalizedHirePay.monthlyGross)}/kuu</p>
            {results.defaultsUsed.hirePay && (
              <p className="text-xs text-orange-600">* Kasutatud Eesti keskmist</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Igakuine tööjõukulu</p>
            <p className="font-medium">{formatCurrency(results.normalizedHirePay.employerMonthlyCost)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sisseelamisperiood</p>
            <p className="font-medium">{inputs.onboarding.onboardingMonths} kuud ({inputs.onboarding.productivityPct}% tootlikkusega)</p>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1">Kulude jaotus</h2>
        <table className="w-full">
          <tbody>
            {blockCostLines.map((line, idx) => (
              <tr key={idx}>
                <td className="py-1">{line.label}</td>
                <td className="py-1 text-right font-medium">{formatCurrency(line.value)}</td>
              </tr>
            ))}
            <tr className="border-t border-gray-300">
              <td className="py-2 font-semibold">Baaskulu</td>
              <td className="py-2 text-right font-semibold">{formatCurrency(results.baseCost)}</td>
            </tr>
            <tr>
              <td className="py-1 text-gray-600">+ Oodatav riskikulu ({(config.BAD_HIRE_RISK_RATE * 100).toFixed(0)}% tõenäosus)</td>
              <td className="py-1 text-right font-medium">{formatCurrency(results.expectedRiskCost)}</td>
            </tr>
            <tr className="border-t-2 border-black font-bold text-lg">
              <td className="py-2">KOKKU</td>
              <td className="py-2 text-right">{formatCurrency(results.totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Key Insights */}
      <section className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-3">Põhilised näitajad</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Kogukulu kuupalga suhtes</p>
            <p className="text-xl font-bold">
              {(results.totalCost / results.normalizedHirePay.monthlyGross).toFixed(1)}× kuupalk
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Kui värbamine ebaõnnestub</p>
            <p className="text-xl font-bold">{formatCurrency(results.badHireExtraIfHappens)} lisakulu</p>
          </div>
        </div>
      </section>

      {/* Top Drivers */}
      {results.topDrivers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1">Suurimad kuluallikad</h2>
          <ol className="list-decimal list-inside">
            {results.topDrivers.map((driver) => (
              <li key={driver.block} className="py-1">
                <span className="font-medium">{driver.label}</span>
                <span className="text-gray-600"> — {formatCurrency(driver.amount)} ({driver.percentage.toFixed(0)}%)</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Disclaimer */}
      <footer className="text-xs text-gray-500 border-t pt-4">
        <p>{config.disclaimerText}</p>
        <p className="mt-2">{config.privacyNotice}</p>
      </footer>

      {/* Print Button (hidden in print) */}
      <div className="mt-8 text-center no-print">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Prindi / Salvesta PDF
        </button>
      </div>
    </div>
  );
};

export default Print;
