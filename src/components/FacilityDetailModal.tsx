import React from 'react';
import { Facility, MedicineItem, Doctor, DiagnosticTest } from '../types';

interface FacilityDetailModalProps {
  facility: Facility | null;
  medicines: MedicineItem[];
  doctors: Doctor[];
  diagnostics: DiagnosticTest[];
  onClose: () => void;
  onInitiateTransfer: (med: MedicineItem) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  medicines,
  doctors,
  diagnostics,
  onClose,
  onInitiateTransfer,
}) => {
  if (!facility) return null;

  const facMeds = medicines.filter((m) => m.facilityId === facility.id);
  const facDocs = doctors.filter((d) => d.facilityId === facility.id);
  const facDiags = diagnostics.filter((t) => t.facilityId === facility.id);
  const occPct = Math.round((facility.bedsOccupied / facility.bedsTotal) * 100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-space-lg bg-surface-container-low border-b border-surface-container flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono-data font-bold uppercase bg-surface-container-lowest text-primary border border-surface-container">
                {facility.type} · {facility.sector}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  facility.status === 'critical'
                    ? 'bg-error-container text-on-error-container'
                    : facility.status === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {facility.status.toUpperCase()}
              </span>
            </div>
            <h3 className="font-headline-md font-bold text-on-surface">{facility.name}</h3>
            <p className="font-body-sm text-outline mt-0.5">{facility.statusReason}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-outline"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg flex-1 overflow-y-auto flex flex-col gap-space-lg">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
            <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
              <span className="text-[11px] text-outline uppercase font-semibold block">Bed Occupancy</span>
              <span className="font-metric-value text-[20px] font-bold text-on-surface">
                {facility.bedsOccupied}/{facility.bedsTotal} ({occPct}%)
              </span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
              <span className="text-[11px] text-outline uppercase font-semibold block">Doctors Active</span>
              <span className="font-metric-value text-[20px] font-bold text-primary">
                {facility.doctorsPresent}/{facility.doctorCount}
              </span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
              <span className="text-[11px] text-outline uppercase font-semibold block">Daily Footfall</span>
              <span className="font-metric-value text-[20px] font-bold text-on-surface">
                {facility.dailyFootfall}
              </span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
              <span className="text-[11px] text-outline uppercase font-semibold block">Solar Backup</span>
              <span className={`font-mono-data text-[14px] font-bold mt-1 block ${
                facility.solarBackupOnline ? 'text-primary' : 'text-error'
              }`}>
                {facility.solarBackupOnline ? 'Online (100%)' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Medicines at this facility */}
          {facMeds.length > 0 && (
            <div>
              <h4 className="font-label-md font-bold text-on-surface uppercase tracking-wider mb-2">
                Pharmacy Inventory Status
              </h4>
              <div className="flex flex-col gap-2">
                {facMeds.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-on-surface block">{med.name}</span>
                      <span className="text-[11px] text-outline">
                        Depletion: {med.hoursUntilDepletion}h · Burn rate: {med.burnRatePerDay} {med.unit}/day
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono-data font-bold ${
                        med.status === 'Critical' ? 'text-error' : 'text-on-surface'
                      }`}>
                        {med.currentUnits} {med.unit}
                      </span>
                      {med.status === 'Critical' && (
                        <button
                          onClick={() => onInitiateTransfer(med)}
                          className="px-2.5 py-1 bg-error text-on-error rounded text-[11px] font-bold hover:bg-on-error-container"
                        >
                          Request Supply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctors at this facility */}
          {facDocs.length > 0 && (
            <div>
              <h4 className="font-label-md font-bold text-on-surface uppercase tracking-wider mb-2">
                Rostered Medical Staff
              </h4>
              <div className="flex flex-col gap-2">
                {facDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-on-surface block">{doc.name}</span>
                      <span className="text-[11px] text-outline">
                        {doc.specialty} · Room {doc.roomNo}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      doc.status === 'absent'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-primary-container text-on-primary-container'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostics at this facility */}
          {facDiags.length > 0 && (
            <div>
              <h4 className="font-label-md font-bold text-on-surface uppercase tracking-wider mb-2">
                Diagnostic Laboratories & Reagents
              </h4>
              <div className="flex flex-col gap-2">
                {facDiags.map((diag) => (
                  <div
                    key={diag.id}
                    className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-on-surface block">{diag.name}</span>
                      <span className="text-[11px] text-outline">
                        Reagent: {diag.reagentStockPct}% · SLA: {diag.turnaroundHours}h
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      diag.available ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'
                    }`}>
                      {diag.available ? 'Available' : 'Depleted'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-md rounded-lg"
          >
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};
