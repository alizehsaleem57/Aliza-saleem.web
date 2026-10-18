import React, { useState } from 'react';

export type EscalationActionType = 'show_cause' | 'deploy_reliever' | 'authorize_transfer' | 'simulate_runaway' | 'modify_route';

interface EscalationModalProps {
  isOpen: boolean;
  type: EscalationActionType | null;
  targetFacilityName: string;
  onClose: () => void;
  onSubmitAction: (message: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  type,
  targetFacilityName,
  onClose,
  onSubmitAction,
}) => {
  if (!isOpen || !type) return null;

  const [notes, setNotes] = useState('');
  const [selectedReliever, setSelectedReliever] = useState('Dr. Shweta Iyer (CHC Sadar HQ)');
  const [transferCount, setTransferCount] = useState(8);
  const [simulatedSpike, setSimulatedSpike] = useState(50);

  const getTitle = () => {
    switch (type) {
      case 'show_cause':
        return `Issue Protocol Show-Cause Notice — ${targetFacilityName}`;
      case 'deploy_reliever':
        return `Emergency Reliever Specialist Dispatch — ${targetFacilityName}`;
      case 'authorize_transfer':
        return `Authorize Step-Down Lateral Transfers — ${targetFacilityName}`;
      case 'simulate_runaway':
        return 'Heuristic Dispatch: Simulate Outpatient Runaway Surge';
      case 'modify_route':
        return 'Modify Redistribution Route Parameters';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let msg = '';
    if (type === 'show_cause') {
      msg = `Official Show-Cause notice dispatched to Medical Officer in charge of ${targetFacilityName}. Unannounced DM inspection scheduled within 48h.`;
    } else if (type === 'deploy_reliever') {
      msg = `Reliever Specialist ${selectedReliever} assigned to ${targetFacilityName}. Transition effective from 14:00 today.`;
    } else if (type === 'authorize_transfer') {
      msg = `Authorized transfer of ${transferCount} step-down patients from ${targetFacilityName} to CHC Sadar Central. Ambulance dispatch notified.`;
    } else if (type === 'simulate_runaway') {
      msg = `Simulated +${simulatedSpike}% viral surge: Depletion accelerates to 11.2h. Recommended reserve buffer increased by 800 vials.`;
    } else if (type === 'modify_route') {
      msg = `Route #R-04 modified: Secondary stop added at PHC Mandi for cold-chain icepack replenishment.`;
    }
    onSubmitAction(msg);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-space-lg border border-surface-container flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-surface-container pb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              {type === 'show_cause' ? 'assignment_late' : type === 'deploy_reliever' ? 'person_add' : 'hotel'}
            </span>
            <h3 className="font-headline-sm font-bold text-on-surface">{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container text-outline">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {type === 'show_cause' && (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-on-surface-variant">
                This notice will be officially logged in the National Health Mission (NHM) governance portal and flagged to the District Magistrate for clinical inquiry.
              </p>
              <label className="text-[12px] font-bold text-outline uppercase">
                Investigation Grounds:
              </label>
              <input
                type="text"
                readOnly
                value="Infant Triage Delay >45 mins (SLA: 10m) & 0% Malaria RDT Reagents"
                className="px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-body-sm font-semibold text-on-surface"
              />
              <label className="text-[12px] font-bold text-outline uppercase mt-1">
                Additional Directives / Inspection Notes:
              </label>
              <textarea
                rows={3}
                placeholder="Enter DM inspection remarks or specific queries to the facility superintendent..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="p-3 bg-surface-container-low border border-surface-container rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-error"
              />
            </div>
          )}

          {type === 'deploy_reliever' && (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-on-surface-variant">
                Address workforce compliance deficit by deploying a stand-by specialist from headquarters to clear pending consultations.
              </p>
              <label className="text-[12px] font-bold text-outline uppercase">
                Select Reliever Medical Officer:
              </label>
              <select
                value={selectedReliever}
                onChange={(e) => setSelectedReliever(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-body-sm font-medium text-on-surface"
              >
                <option value="Dr. Shweta Iyer (CHC Sadar HQ)">Dr. Shweta Iyer (Senior GDMO · CHC Sadar HQ)</option>
                <option value="Dr. K. Verma (Civil Hospital)">Dr. K. Verma (Cardiologist Reliever · Civil Hospital)</option>
                <option value="Dr. P. Sen (North District Reserve)">Dr. P. Sen (General Physician · North Mobile Unit)</option>
              </select>
            </div>
          )}

          {type === 'authorize_transfer' && (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-on-surface-variant">
                Decongest 100% bed saturation at {targetFacilityName} by initiating ambulance transfers for stable post-operative and step-down patients.
              </p>
              <label className="text-[12px] font-bold text-outline uppercase">
                Number of Patients to Transfer:
              </label>
              <input
                type="number"
                min={1}
                max={18}
                value={transferCount}
                onChange={(e) => setTransferCount(Number(e.target.value))}
                className="px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-body-sm font-bold text-on-surface"
              />
              <span className="text-[11px] text-outline">
                Receiving Hub: CHC Sadar Central (12 Free Beds Available)
              </span>
            </div>
          )}

          {type === 'simulate_runaway' && (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-on-surface-variant">
                Model viral surge stress tests against PHC Kalyanpur stock to verify buffer resilience.
              </p>
              <label className="text-[12px] font-bold text-outline uppercase">
                Simulated Outpatient Spike: +{simulatedSpike}%
              </label>
              <input
                type="range"
                min={20}
                max={200}
                step={10}
                value={simulatedSpike}
                onChange={(e) => setSimulatedSpike(Number(e.target.value))}
                className="w-full accent-tertiary"
              />
              <span className="text-[11px] text-tertiary font-semibold">
                Projected Amoxicillin Depletion: {Math.max(4, Math.round(18 / (1 + simulatedSpike / 100)))} hours
              </span>
            </div>
          )}

          {type === 'modify_route' && (
            <div className="flex flex-col gap-2">
              <p className="font-body-sm text-on-surface-variant">
                Adjust Health Van Fleet #DHV-09 delivery sequence and cargo allocation.
              </p>
              <label className="text-[12px] font-bold text-outline uppercase">
                Transport Conduit:
              </label>
              <input
                type="text"
                readOnly
                value="Civil CHC Rampur ➔ PHC Mandi ➔ PHC Kalyanpur (22.8 km)"
                className="px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg text-body-sm font-medium"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-space-xs pt-space-xs border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-sm transition-all"
            >
              Confirm & Execute Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
