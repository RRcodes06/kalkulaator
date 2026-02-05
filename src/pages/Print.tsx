import { useAppStore } from '@/store/appStore';
import { useEffect } from 'react';

const Print = () => {
  const { userInputs, computedResults, config } = useAppStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('et-EE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    // Auto-print when page loads (optional)
    // window.print();
  }, []);

  const costLines = [
    { label: 'Sisemised ajakulud', value: computedResults.totalInternalTimeCost },
    { label: '  - Personalitöötaja', value: computedResults.hrTimeCost },
    { label: '  - Juht', value: computedResults.managerTimeCost },
    { label: '  - Teised töötajad', value: computedResults.otherStaffTimeCost },
    { label: 'Välised kulud', value: computedResults.totalExternalCosts },
    { label: 'Sisseelamise kulud', value: computedResults.totalOnboardingCost },
    { label: 'Tootlikkuse kadu', value: computedResults.productivityLossCost },
    { label: 'Halva värbamise risk', value: computedResults.badHireRiskCost },
  ];

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
            <p className="font-medium">{userInputs.positionTitle || 'Määramata'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Brutopalk</p>
            <p className="font-medium">{formatCurrency(userInputs.grossSalary)}/kuu</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Igakuine tööjõukulu</p>
            <p className="font-medium">{formatCurrency(computedResults.totalEmployerCost)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sisseelamisperiood</p>
            <p className="font-medium">{userInputs.monthsToFullProductivity} kuud</p>
          </div>
        </div>
      </section>

      {/* Cost Breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-1">Kulude jaotus</h2>
        <table className="w-full">
          <tbody>
            {costLines.map((line, idx) => (
              <tr key={idx} className={line.label.startsWith('  ') ? 'text-sm text-gray-600' : ''}>
                <td className="py-1">{line.label}</td>
                <td className="py-1 text-right font-medium">{formatCurrency(line.value)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-black font-bold text-lg">
              <td className="py-2">KOKKU</td>
              <td className="py-2 text-right">{formatCurrency(computedResults.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Key Insights */}
      <section className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-3">Põhilised näitajad</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Kulu % aasta brutopalgast</p>
            <p className="text-xl font-bold">{computedResults.costAsPercentOfAnnualSalary.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Kuupalga ekvivalent</p>
            <p className="text-xl font-bold">{computedResults.monthsOfSalaryEquivalent.toFixed(1)}× kuupalk</p>
          </div>
        </div>
      </section>

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
