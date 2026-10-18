import React, { useState } from 'react';
import { Role, Language, NavTab, Facility, MedicineItem, RedistributionDispatch } from './types';
import {
  INITIAL_FACILITIES,
  INITIAL_MEDICINES,
  INITIAL_DOCTORS,
  INITIAL_DIAGNOSTICS,
  INITIAL_DISPATCH,
  INITIAL_ESCALATIONS,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DistrictOverview } from './components/DistrictOverview';
import { StockAndMedicines } from './components/StockAndMedicines';
import { FootfallAndBedGrid } from './components/FootfallAndBedGrid';
import { DoctorRoster } from './components/DoctorRoster';
import { DiagnosticAudit } from './components/DiagnosticAudit';
import { ProblemStatementView } from './components/ProblemStatementView';
import { PatientPortal } from './components/PatientPortal';
import { PatientAppointmentPage } from './components/PatientAppointmentPage';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { FacilityDetailModal } from './components/FacilityDetailModal';
import { EscalationModal, EscalationActionType } from './components/EscalationModal';
import { AiAssistantModal } from './components/AiAssistantModal';

export default function App() {
  // Navigation & Role states
  const [currentTab, setCurrentTab] = useState<NavTab>('district-overview');
  const [currentRole, setCurrentRole] = useState<Role>('cmo_district');
  const [language, setLanguage] = useState<Language>('en');
  const [crisisOverride, setCrisisOverride] = useState(false);

  // Data states
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [medicines, setMedicines] = useState<MedicineItem[]>(INITIAL_MEDICINES);
  const [doctors] = useState(INITIAL_DOCTORS);
  const [diagnostics] = useState(INITIAL_DIAGNOSTICS);
  const [dispatch, setDispatch] = useState<RedistributionDispatch>(INITIAL_DISPATCH);

  // Modals & Drawers
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [codeInspectorOpen, setCodeInspectorOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [escalationType, setEscalationType] = useState<EscalationActionType | null>(null);
  const [escalationTarget, setEscalationTarget] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1-Click Authorize Redistribution Action
  const handleAuthorizeDispatch = () => {
    setDispatch((prev) => ({
      ...prev,
      status: 'En Route',
      timestamp: 'Dispatched 1m ago',
    }));

    // Update Rampur surplus and Kalyanpur replenishment
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.facilityName.includes('Rampur') && m.name.includes('Amoxicillin')) {
          return { ...m, currentUnits: m.currentUnits - 1500 };
        }
        if (m.facilityName.includes('Kalyanpur') && m.name.includes('Amoxicillin')) {
          return { ...m, currentUnits: m.currentUnits + 1500, status: 'Adequate', hoursUntilDepletion: 720 };
        }
        return m;
      })
    );

    // Update facility status
    setFacilities((prev) =>
      prev.map((f) => {
        if (f.id === 'fac-04') {
          return {
            ...f,
            status: 'in-transit',
            statusReason: 'Supply Van #DHV-09 en route with 1,500 vials Amoxicillin (ETA 42m)',
          };
        }
        return f;
      })
    );

    showToast('Fleet #DHV-09 Authorized & Dispatched to PHC Kalyanpur (ETA: 42 mins)');
  };

  // Handlers for Escalation Actions
  const handleOpenShowCause = (facName: string) => {
    setEscalationTarget(facName);
    setEscalationType('show_cause');
    setEscalationModalOpen(true);
  };

  const handleDeployReliever = (facName: string) => {
    setEscalationTarget(facName);
    setEscalationType('deploy_reliever');
    setEscalationModalOpen(true);
  };

  const handleAuthorizeTransfer = (facName: string) => {
    setEscalationTarget(facName);
    setEscalationType('authorize_transfer');
    setEscalationModalOpen(true);
  };

  const handleSimulateRunaway = () => {
    setEscalationTarget('PHC Kalyanpur');
    setEscalationType('simulate_runaway');
    setEscalationModalOpen(true);
  };

  const handleModifyRoute = () => {
    setEscalationTarget('Route #R-04');
    setEscalationType('modify_route');
    setEscalationModalOpen(true);
  };

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Facility ID,Name,Type,Sector,Beds Occupied,Beds Total,Doctors On Duty,Stock Risk Hours,Status\n' +
      facilities
        .slice(0, 20)
        .map(
          (f) =>
            `${f.id},"${f.name}",${f.type},${f.sector},${f.bedsOccupied},${f.bedsTotal},${f.doctorsPresent},${f.stockRiskHours},${f.status}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PulseGrid_Audit_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit Matrix exported successfully as CSV.');
  };

  const handleInstantTriage = () => {
    setCurrentTab('district-overview');
    showToast('Telemetry Mesh triage complete: 3 critical nodes isolated for intervention.');
  };

  const handleInitiateTransferFromStock = (med: MedicineItem) => {
    showToast(`Transfer order initiated for ${med.name}. Nearest hub Civil CHC Rampur selected for dispatch.`);
  };

  // Determine hospital filter when a specific hospital role is selected
  const hospitalFilter =
    currentRole === 'hospital_public'
      ? 'a public hospital'
      : currentRole === 'hospital_chronicle'
      ? 'Chronicle Health Center'
      : undefined;

  return (
    <div className={`min-h-screen bg-surface text-on-surface font-body-md ${crisisOverride ? 'ring-4 ring-error/40 ring-inset' : ''}`}>
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-2 border border-outline-variant/30 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">verified</span>
          <span className="font-body-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Role Notice Banner if in Hospital View */}
      {hospitalFilter && (
        <div className="pl-72 pt-16 bg-primary-container text-on-primary-container px-space-lg py-1.5 text-[12px] font-bold flex items-center justify-between z-30">
          <span>Active Role Scope: Viewing {hospitalFilter} authorized internal operations.</span>
          <button
            onClick={() => setCurrentRole('cmo_district')}
            className="underline hover:opacity-80 text-[11px]"
          >
            Switch back to District Command
          </button>
        </div>
      )}

      {/* When in Patient Role: Render strictly Patient Portal */}
      {currentRole === 'patient' ? (
        <div className="w-full min-h-screen bg-surface">
          {/* Patient Header */}
          <header className="h-16 bg-surface-container-lowest border-b border-surface-container px-space-lg flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                  PulseGrid Citizen Portal
                </span>
                <span className="font-label-sm text-[11px] text-outline">North Central District Health Mission</span>
              </div>
            </div>

            <div className="flex items-center gap-space-md">
              <button
                onClick={() => setCodeInspectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface rounded-lg text-label-sm font-bold border border-surface-container hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">code</span>
                Inspect & Download Code
              </button>

              <div className="inline-flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container">
                {(['en', 'hi', 'bn', 'ta'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-all ${
                      language === l
                        ? 'bg-surface-container-lowest shadow-sm font-bold text-secondary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : l === 'bn' ? 'বাংলা' : 'தமிழ்'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentRole('cmo_district')}
                className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-label-sm font-bold hover:bg-primary-container transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                Staff Login
              </button>
            </div>
          </header>

          <main className="w-full">
            <PatientPortal
              language={language}
              facilities={facilities}
              doctors={doctors}
              diagnostics={diagnostics}
            />
          </main>
        </div>
      ) : (
        /* Authorized Staff & District Command Views */
        <div>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'ai-assistant') {
                setAiAssistantOpen(true);
              } else {
                setCurrentTab(tab);
              }
            }}
            language={language}
            crisisOverride={crisisOverride}
            onToggleCrisis={() => {
              const next = !crisisOverride;
              setCrisisOverride(next);
              showToast(
                next
                  ? 'CRISIS OVERRIDE ACTIVATED: All district stock thresholds raised by 50%.'
                  : 'Crisis override deactivated. Normal telemetry resumed.'
              );
            }}
          />

          <div className="pl-72">
            <Header
              currentRole={currentRole}
              onChangeRole={(role) => {
                setCurrentRole(role);
                if (role === 'patient') {
                  showToast('Switched to restricted Patient / Citizen View.');
                } else if (role === 'hospital_public') {
                  showToast("Switched context to 'a public hospital'.");
                } else if (role === 'hospital_chronicle') {
                  showToast("Switched context to 'Chronicle Health Center'.");
                } else {
                  showToast('Switched context to District Command (All 50 nodes).');
                }
              }}
              language={language}
              onChangeLanguage={setLanguage}
              unreadCount={INITIAL_ESCALATIONS.length}
              onOpenNotifications={() => {
                showToast('3 Active DM Review Escalations: PHC Belsar, PHC Sonapur, CHC Mohanpur');
              }}
              onOpenCodeInspector={() => setCodeInspectorOpen(true)}
            />

            <main className="relative w-full pt-16 bg-surface min-h-screen">
              {currentTab === 'district-overview' && (
                <DistrictOverview
                  language={language}
                  facilities={facilities}
                  dispatch={dispatch}
                  onAuthorizeDispatch={handleAuthorizeDispatch}
                  onOpenFacility={setSelectedFacility}
                  onOpenShowCause={handleOpenShowCause}
                  onDeployReliever={handleDeployReliever}
                  onAuthorizeTransfer={handleAuthorizeTransfer}
                  onExportAudit={handleExportAudit}
                  onInstantTriage={handleInstantTriage}
                  onSimulateRunaway={handleSimulateRunaway}
                  onModifyRoute={handleModifyRoute}
                  hospitalFilter={hospitalFilter}
                />
              )}

              {currentTab === 'stock-and-medicines' && (
                <StockAndMedicines
                  medicines={medicines}
                  facilities={facilities}
                  language={language}
                  onInitiateTransfer={handleInitiateTransferFromStock}
                />
              )}

              {currentTab === 'footfall-and-bed-grid' && (
                <FootfallAndBedGrid
                  facilities={facilities}
                  language={language}
                  onOpenFacility={setSelectedFacility}
                  onAuthorizeTransfer={handleAuthorizeTransfer}
                />
              )}

              {currentTab === 'doctor-roster' && (
                <DoctorRoster
                  doctors={doctors}
                  facilities={facilities}
                  language={language}
                  onDeployReliever={handleDeployReliever}
                />
              )}

              {currentTab === 'diagnostic-audit' && (
                <DiagnosticAudit
                  diagnostics={diagnostics}
                  facilities={facilities}
                  language={language}
                />
              )}

              {currentTab === 'problem-statement' && (
                <ProblemStatementView
                  language={language}
                  onExploreDashboard={() => setCurrentTab('district-overview')}
                />
              )}

              {currentTab === 'book-appointment' && (
                <PatientAppointmentPage
                  facilities={facilities}
                  doctors={doctors}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Code Inspector & Downloader Modal */}
      <CodeInspectorModal
        isOpen={codeInspectorOpen}
        onClose={() => setCodeInspectorOpen(false)}
      />

      {/* Facility Inspection Telemetry Modal */}
      <FacilityDetailModal
        facility={selectedFacility}
        medicines={medicines}
        doctors={doctors}
        diagnostics={diagnostics}
        onClose={() => setSelectedFacility(null)}
        onInitiateTransfer={handleInitiateTransferFromStock}
      />

      {/* Escalation Execution Modal */}
      <EscalationModal
        isOpen={escalationModalOpen}
        type={escalationType}
        targetFacilityName={escalationTarget}
        onClose={() => setEscalationModalOpen(false)}
        onSubmitAction={(msg) => showToast(msg)}
      />

      {/* AI Dynamic Copilot Modal */}
      <AiAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        language={language}
        currentRole={currentRole}
      />
    </div>
  );
}
