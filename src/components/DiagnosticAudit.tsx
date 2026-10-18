import React, { useState } from 'react';
import { DiagnosticTest, Facility, Language } from '../types';

interface DiagnosticAuditProps {
  diagnostics: DiagnosticTest[];
  facilities: Facility[];
  language: Language;
}

export const DiagnosticAudit: React.FC<DiagnosticAuditProps> = ({
  diagnostics,
  facilities,
}) => {
  const [filterCat, setFilterCat] = useState('All');
  const [routedSuccess, setRoutedSuccess] = useState<string | null>(null);

  const categories = ['All', 'Rapid Test', 'Hematology', 'Biochemistry', 'Maternal', 'Serology'];

  const filteredTests = diagnostics.filter(
    (t) => filterCat === 'All' || t.category === filterCat
  );

  const handleRouteSample = (testName: string, fromFac: string) => {
    setRoutedSuccess(`Sample courier dispatched from ${fromFac} to CHC Sadar Central Hub. Digital report turnaround: 3.5 hrs.`);
    setTimeout(() => {
      setRoutedSuccess(null);
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-space-lg py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-primary text-label-sm font-label-sm uppercase font-bold tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">biotech</span>
            Lab Reagent Telemetry & Diagnostic Continuity
          </div>
          <h1 className="font-display-lg text-headline-lg text-on-surface font-bold">
            District Diagnostic Audit & Smart Sample Routing
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Real-time monitoring of test availability and cold-chain integrity (2°C - 8°C). When peripheral PHC reagents deplete, samples are automatically routed to accredited CHC hub laboratories.
          </p>
        </div>

        {/* Cold Chain Badge */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">device_thermostat</span>
          </div>
          <div>
            <span className="font-label-sm text-outline uppercase block font-semibold">Cold Chain Status</span>
            <span className="font-mono-data text-primary font-bold text-[15px]">3.8°C Nominal (48/50 Active)</span>
          </div>
        </div>
      </div>

      {routedSuccess && (
        <div className="p-space-md bg-primary-container text-on-primary-container rounded-xl flex items-center gap-2 border border-primary/20 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          <span className="font-body-sm font-semibold">{routedSuccess}</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="font-label-sm text-outline uppercase font-semibold mr-1">Filter Test Type:</span>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-colors ${
              filterCat === c
                ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tests Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-label-sm text-outline font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Test Description</th>
                <th className="py-3 px-4">Testing Facility</th>
                <th className="py-3 px-4">Reagent Level</th>
                <th className="py-3 px-4">Turnaround SLA</th>
                <th className="py-3 px-4">Public Status</th>
                <th className="py-3 px-4 text-right">Autonomous Hub Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface">
              {filteredTests.map((test) => {
                const isDepleted = !test.available || test.reagentStockPct === 0;

                return (
                  <tr key={test.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{test.name}</span>
                        <span className="text-[11px] text-outline">Category: {test.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{test.facilityName}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isDepleted ? 'bg-error' : test.reagentStockPct < 40 ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${test.reagentStockPct}%` }}
                          ></div>
                        </div>
                        <span
                          className={`font-mono-data text-[12px] font-bold ${
                            isDepleted ? 'text-error' : 'text-on-surface'
                          }`}
                        >
                          {test.reagentStockPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-outline">
                      {test.turnaroundHours < 1
                        ? `${Math.round(test.turnaroundHours * 60)} mins`
                        : `${test.turnaroundHours} hrs`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDepleted
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                      >
                        {isDepleted ? 'Reagents Exhausted' : 'Operational (Free)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isDepleted ? (
                        <button
                          onClick={() => handleRouteSample(test.name, test.facilityName)}
                          className="px-3 py-1 bg-tertiary hover:bg-tertiary-container text-on-tertiary rounded text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                          Route to CHC Sadar Hub
                        </button>
                      ) : (
                        <span className="text-[11px] text-primary font-semibold">On-site Processing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
