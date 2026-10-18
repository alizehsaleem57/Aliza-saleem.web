import React, { useState } from 'react';
import { Facility, Language } from '../types';

interface FootfallAndBedGridProps {
  facilities: Facility[];
  language: Language;
  onOpenFacility: (fac: Facility) => void;
  onAuthorizeTransfer: (facName: string) => void;
}

export const FootfallAndBedGrid: React.FC<FootfallAndBedGridProps> = ({
  facilities,
  onOpenFacility,
  onAuthorizeTransfer,
}) => {
  const [selectedWard, setSelectedWard] = useState<'all' | 'maternity' | 'icu' | 'general'>('all');

  const totalBeds = facilities.reduce((acc, f) => acc + f.bedsTotal, 0);
  const occupiedBeds = facilities.reduce((acc, f) => acc + f.bedsOccupied, 0);
  const totalOccupancyPct = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  // Hourly surge distribution (simulation of morning peak)
  const hourlySurge = [
    { hour: '07:00', count: 45 },
    { hour: '08:00', count: 180 },
    { hour: '09:00', count: 340 },
    { hour: '10:00', count: 480 },
    { hour: '11:00', count: 520 },
    { hour: '12:00', count: 410 },
    { hour: '13:00', count: 290 },
    { hour: '14:00', count: 190 },
    { hour: '15:00', count: 120 },
    { hour: '16:00', count: 95 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-space-lg py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-primary text-label-sm font-label-sm uppercase font-bold tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">single_bed</span>
            Bed Grid & Regional Surge Surveillance
          </div>
          <h1 className="font-display-lg text-headline-lg text-on-surface font-bold">
            District Bed Capacity & Outpatient Surge Grid
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Real-time telemetry across General, Maternity, Pediatric, and Trauma ICU beds. Prevents facility saturation by orchestrating lateral step-down transfers.
          </p>
        </div>

        {/* Global Occupancy Banner */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex items-center gap-space-md">
          <div className="flex flex-col">
            <span className="font-label-sm text-outline uppercase font-semibold">District Aggregate Load</span>
            <div className="flex items-baseline gap-2">
              <span className="font-metric-value text-metric-value text-error font-bold">{totalOccupancyPct}%</span>
              <span className="font-label-sm text-on-surface-variant">
                {occupiedBeds.toLocaleString()} / {totalBeds.toLocaleString()} beds
              </span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-error/20 border-t-error flex items-center justify-center font-bold text-sm text-error">
            {totalOccupancyPct}%
          </div>
        </div>
      </div>

      {/* Hourly Surge Analytics Card */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-surface-container flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">show_chart</span>
            <h3 className="font-headline-sm font-bold text-on-surface">Hourly Outpatient Footfall Surge Curve</h3>
          </div>
          <span className="font-mono-data text-mono-data text-outline">Peak Operational Window: 09:30 - 11:30 AM</span>
        </div>

        <div className="flex items-end gap-3 h-36 bg-surface-container-low p-4 rounded-xl border border-surface-container">
          {hourlySurge.map((item, i) => {
            const heightPct = (item.count / 550) * 100;
            const isPeak = item.count > 450;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono-data text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div
                  className={`w-full rounded-t transition-all ${
                    isPeak ? 'bg-error animate-pulse' : 'bg-primary'
                  }`}
                  style={{ height: `${heightPct}%` }}
                ></div>
                <span className="text-[11px] font-mono-data text-on-surface-variant font-medium">{item.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility Beds Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {facilities.slice(0, 12).map((fac) => {
          const occPct = Math.round((fac.bedsOccupied / fac.bedsTotal) * 100);
          const isCritical = occPct >= 95;
          const isWarning = occPct >= 80 && occPct < 95;

          return (
            <div
              key={fac.id}
              onClick={() => onOpenFacility(fac)}
              className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-space-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono-data uppercase font-bold text-outline">
                    {fac.type} · {fac.sector}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical
                        ? 'bg-error-container text-on-error-container'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-primary-container/20 text-primary'
                    }`}
                  >
                    {isCritical ? 'Saturated' : isWarning ? 'High Load' : 'Available'}
                  </span>
                </div>
                <h4 className="font-headline-sm font-bold text-on-surface">{fac.name}</h4>
                <p className="font-body-sm text-outline mt-0.5">
                  Daily Outpatient Footfall: {fac.dailyFootfall} patients
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono-data text-body-sm">
                  <span className="text-on-surface-variant">Occupancy:</span>
                  <span className={`font-bold ${isCritical ? 'text-error' : 'text-on-surface'}`}>
                    {fac.bedsOccupied} / {fac.bedsTotal} beds ({occPct}%)
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-error' : isWarning ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{ width: `${occPct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                <span className="text-[11px] text-outline font-medium">Triage SLA: ~{fac.triageDelayMins}m</span>
                {isCritical && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAuthorizeTransfer(fac.name);
                    }}
                    className="px-2.5 py-1 bg-error text-on-error rounded text-[11px] font-bold hover:bg-on-error-container shadow-xs"
                  >
                    Authorize Transfers
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
