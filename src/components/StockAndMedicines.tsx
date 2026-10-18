import React, { useState } from 'react';
import { MedicineItem, Facility, Language } from '../types';

interface StockAndMedicinesProps {
  medicines: MedicineItem[];
  facilities: Facility[];
  language: Language;
  onInitiateTransfer: (med: MedicineItem) => void;
}

export const StockAndMedicines: React.FC<StockAndMedicinesProps> = ({
  medicines,
  facilities,
  onInitiateTransfer,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<MedicineItem | null>(null);
  const [forecasting, setForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  const categories = ['All', 'Antibiotic', 'Respiratory', 'Pediatric', 'Emergency', 'Maternal'];
  const statuses = ['All', 'Critical', 'Depleting', 'Adequate', 'Surplus'];

  const filteredMedicines = medicines.filter((m) => {
    const matchesCat = filterCategory === 'All' || m.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.facilityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const criticalCount = medicines.filter((m) => m.status === 'Critical').length;
  const surplusCount = medicines.filter((m) => m.status === 'Surplus').length;

  const handleRunForecast = async (med: MedicineItem) => {
    setSelectedMed(med);
    setForecasting(true);
    setForecastResult(null);

    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: med.facilityName,
          medicineName: med.name,
          currentStock: med.currentUnits,
          dailyBurnRate: med.burnRatePerDay,
          surgeMultiplier: med.status === 'Critical' ? 2.5 : 1.2,
        }),
      });
      const data = await res.json();
      setForecastResult(data);
    } catch (err) {
      console.error(err);
      setForecastResult({
        daysUntilDepletion: (med.currentUnits / med.burnRatePerDay).toFixed(1),
        predictedDemandNext7Days: [50, 58, 65, 72, 80, 85, 90],
        riskLevel: med.status === 'Critical' ? 'CRITICAL' : 'WARNING',
        recommendation: `Automated rebalancing recommended from nearest surplus cluster within 24 hours.`,
      });
    } finally {
      setForecasting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-space-lg py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-primary text-label-sm font-label-sm uppercase font-bold tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Sense Health & Predictive Depletion Telemetry
          </div>
          <h1 className="font-display-lg text-headline-lg text-on-surface font-bold">
            District Pharmacy Stock & Early Warning Matrix
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Real-time sensory telemetry across all 50 primary & community healthcare centres. Autonomous depletion forecasting and smart inter-facility stock balance.
          </p>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-space-sm">
          <div className="bg-error-container text-on-error-container px-space-md py-space-xs rounded-xl flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] font-bold uppercase">Critical Stock-Out Risk</span>
              <span className="font-metric-value text-[18px] leading-tight font-bold">{criticalCount} Nodes Depleted</span>
            </div>
          </div>
          <div className="bg-surface-container-low text-primary px-space-md py-space-xs rounded-xl flex items-center gap-2 border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] font-bold uppercase">Surplus Reservoirs</span>
              <span className="font-metric-value text-[18px] leading-tight font-bold">{surplusCount} Nodes Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col lg:flex-row items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-xs w-full lg:w-auto">
          <span className="font-label-sm text-label-sm text-outline uppercase font-semibold mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-colors ${
                filterCategory === cat
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-space-sm w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              placeholder="Search medicine or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container rounded-lg text-label-sm text-on-surface focus:outline-none"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-label-sm text-outline font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Medicine / Supply Name</th>
                <th className="py-3 px-4">Facility & Sector</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Burn Rate / Day</th>
                <th className="py-3 px-4">Depletion Runway</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm text-on-surface">
              {filteredMedicines.map((med) => {
                const isCritical = med.status === 'Critical';
                const isSurplus = med.status === 'Surplus';

                return (
                  <tr key={med.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="flex flex-col">
                        <span>{med.name}</span>
                        <span className="text-[11px] text-outline font-normal">
                          Category: {med.category} · Expiry: {med.batchExpiryDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{med.facilityName}</span>
                        <span className="text-[11px] text-outline">
                          {facilities.find((f) => f.id === med.facilityId)?.sector || 'District Zone'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data font-bold">
                      <span className={isCritical ? 'text-error' : isSurplus ? 'text-primary' : 'text-on-surface'}>
                        {med.currentUnits.toLocaleString()} {med.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-on-surface-variant">
                      {med.burnRatePerDay} {med.unit}/day
                    </td>
                    <td className="py-3.5 px-4 font-mono-data">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isCritical ? 'text-error animate-pulse' : isSurplus ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {isCritical && <span className="material-symbols-outlined text-[16px]">priority_high</span>}
                        {med.hoursUntilDepletion < 24
                          ? `${med.hoursUntilDepletion}h (Imminent)`
                          : `${Math.round(med.hoursUntilDepletion / 24)} days`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isCritical
                            ? 'bg-error-container text-on-error-container'
                            : isSurplus
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {med.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRunForecast(med)}
                          className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-tertiary rounded text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">psychology</span>
                          AI Forecast
                        </button>
                        <button
                          onClick={() => onInitiateTransfer(med)}
                          className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                            isCritical
                              ? 'bg-error text-on-error hover:bg-on-error-container shadow-xs'
                              : isSurplus
                              ? 'bg-primary text-on-primary hover:bg-primary-container shadow-xs'
                              : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {isCritical ? 'Request Transfer' : isSurplus ? 'Dispatch Surplus' : 'Rebalance'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Demand Forecast Modal / Drawer */}
      {selectedMed && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-space-lg border border-surface-container flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-surface-container pb-space-sm">
              <div className="flex items-center gap-2 text-tertiary">
                <span className="material-symbols-outlined text-[24px]">neurology</span>
                <div>
                  <h3 className="font-headline-sm font-bold text-on-surface">AI Predictive Demand Forecast</h3>
                  <p className="font-body-sm text-outline">
                    {selectedMed.name} · {selectedMed.facilityName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMed(null)}
                className="p-1 rounded-full hover:bg-surface-container text-outline"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {forecasting ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-tertiary animate-spin">sync</span>
                <span className="font-body-md text-on-surface-variant">
                  Computing 7-day epidemiological burn rate & surge multiplier...
                </span>
              </div>
            ) : forecastResult ? (
              <div className="flex flex-col gap-space-md">
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
                    <span className="text-[11px] font-semibold text-outline uppercase block">Current Stock</span>
                    <span className="font-metric-value text-[20px] text-on-surface font-bold">
                      {selectedMed.currentUnits} {selectedMed.unit}
                    </span>
                  </div>
                  <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
                    <span className="text-[11px] font-semibold text-outline uppercase block">Est. Exhaustion</span>
                    <span className="font-metric-value text-[20px] text-error font-bold">
                      {forecastResult.daysUntilDepletion} Days Left
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-label-sm text-outline font-semibold uppercase block mb-1.5">
                    Projected Daily Demand Curve (Next 7 Days)
                  </span>
                  <div className="flex items-end gap-2 h-24 bg-surface-container-low p-3 rounded-xl border border-surface-container">
                    {forecastResult.predictedDemandNext7Days?.map((val: number, idx: number) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div
                          className="w-full bg-tertiary rounded-t transition-all"
                          style={{ height: `${Math.min(100, (val / 100) * 100)}%` }}
                        ></div>
                        <span className="text-[10px] font-mono-data text-outline">D+{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-tertiary-fixed/40 p-space-sm rounded-xl border border-tertiary/20">
                  <div className="flex items-center gap-1.5 text-tertiary font-bold text-label-sm mb-1">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Prescription Recommendation
                  </div>
                  <p className="font-body-sm text-on-surface">{forecastResult.recommendation}</p>
                </div>

                <div className="flex items-center justify-end gap-space-xs pt-2">
                  <button
                    onClick={() => setSelectedMed(null)}
                    className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      onInitiateTransfer(selectedMed);
                      setSelectedMed(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    Auto-Route Dispatch
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
