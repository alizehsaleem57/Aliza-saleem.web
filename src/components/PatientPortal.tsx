import React, { useState } from 'react';
import { Facility, Doctor, DiagnosticTest, Language } from '../types';
import { translations } from '../i18n/translations';
import { PatientAppointmentPage } from './PatientAppointmentPage';

interface PatientPortalProps {
  language: Language;
  facilities: Facility[];
  doctors: Doctor[];
  diagnostics: DiagnosticTest[];
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  language,
  facilities,
  doctors,
  diagnostics,
}) => {
  const t = translations[language] || translations.en;

  // Mode: either 'directory' or 'booking'
  const [activeMode, setActiveMode] = useState<'booking' | 'directory'>('booking');
  const [preselectedHospitalId, setPreselectedHospitalId] = useState<string>('');
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string>('');

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac-01'); // Hamidia Hospital
  const [symptomsInput, setSymptomsInput] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageAdvice, setTriageAdvice] = useState<any>(null);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const availableDoctors = doctors.filter(
    (d) => d.facilityId === selectedFacilityId && (d.status === 'on-duty' || d.status === 'tele-triage')
  );

  const availableDiagnostics = diagnostics.filter(
    (d) => d.facilityId === selectedFacilityId
  );

  const handleSymptomTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;

    setTriageLoading(true);
    setTriageAdvice(null);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomsInput,
          location: selectedFacility.name,
          language,
        }),
      });
      const data = await res.json();
      setTriageAdvice(data);
    } catch (err) {
      console.error(err);
      setTriageAdvice({
        recommendedDepartment: 'General Outpatient Clinic (OPD)',
        urgencyLevel: 'Routine',
        guidance: 'Please register at the OPD counter. Morning consultations and basic medications are provided free of charge.',
        recommendedFacilityTypes: ['PHC', 'CHC']
      });
    } finally {
      setTriageLoading(false);
    }
  };

  const handleBookDoctorDirectly = (doc: Doctor) => {
    setPreselectedHospitalId(doc.facilityId);
    setPreselectedDoctorId(doc.id);
    setActiveMode('booking');
  };

  return (
    <div className="w-full">
      {/* Top Mode Segmented Bar */}
      <div className="max-w-6xl mx-auto px-space-lg pt-6">
        <div className="bg-surface-container-low p-1.5 rounded-2xl border border-surface-container flex items-center justify-center gap-2 max-w-lg mx-auto shadow-sm">
          <button
            onClick={() => setActiveMode('booking')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeMode === 'booking'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Book Appointment (11 AM - 3 PM)
          </button>
          <button
            onClick={() => setActiveMode('directory')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeMode === 'directory'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">local_hospital</span>
            Bhopal Centers & Doctors
          </button>
        </div>
      </div>

      {activeMode === 'booking' ? (
        <PatientAppointmentPage
          facilities={facilities}
          doctors={doctors}
          initialHospitalId={preselectedHospitalId}
          initialDoctorId={preselectedDoctorId}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-space-lg py-8 flex flex-col gap-space-xl">
          {/* Patient Welcome Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-surface-container-low to-secondary/10 p-space-xl rounded-2xl border border-surface-container">
            <div className="max-w-3xl flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-1.5 text-primary text-label-sm font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                Public Citizen Care & OPD Directory · Bhopal
              </div>
              <h1 className="font-display-lg text-headline-lg text-on-surface font-bold">
                {t.patientPortalTitle}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t.patientPortalSubtitle}
              </p>

              <div className="p-space-sm bg-surface-container-lowest/80 rounded-xl border border-surface-container/60 mt-2 text-[12px] text-outline font-medium">
                🔒 {t.roleRestrictedNotice}
              </div>
            </div>
          </div>

          {/* Facility Selector */}
          <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
              <div>
                <span className="font-label-sm text-outline uppercase font-semibold block">
                  {t.patientSelectFacility}
                </span>
                <span className="font-headline-sm font-bold text-on-surface">
                  {selectedFacility.name} ({selectedFacility.type})
                </span>
              </div>
            </div>

            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="px-4 py-2 bg-surface-container-low border border-surface-container rounded-xl text-label-md font-bold text-on-surface focus:outline-none focus:border-primary"
            >
              {facilities.slice(0, 10).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.sector} ({f.type})
                </option>
              ))}
            </select>
          </div>

          {/* Bed Status Quick Summary for Citizen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-outline uppercase block">Available General Beds</span>
                <span className="font-metric-value text-[22px] text-primary font-bold">
                  {Math.max(0, selectedFacility.bedsTotal - selectedFacility.bedsOccupied)} Beds Free
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Total Capacity: {selectedFacility.bedsTotal} beds
                </span>
              </div>
              <span className="material-symbols-outlined text-primary text-[32px]">hotel</span>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-outline uppercase block">Maternity / Delivery Unit</span>
                <span className="font-metric-value text-[22px] text-secondary font-bold">24x7 Open</span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Staff Nurse on Duty
                </span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[32px]">pregnant_woman</span>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-outline uppercase block">Estimated OPD Wait Time</span>
                <span className="font-metric-value text-[22px] text-on-surface font-bold">
                  ~{selectedFacility.triageDelayMins} Mins
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  Morning Token Window: 08:00 - 14:00
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-[32px]">schedule</span>
            </div>
          </div>

          {/* Doctors On Duty Section */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">stethoscope</span>
                <h2 className="font-headline-md font-bold text-on-surface">{t.patientAvailableDoctors}</h2>
              </div>
              <button
                onClick={() => setActiveMode('booking')}
                className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Book Appointment on Calendar
              </button>
            </div>

            {availableDoctors.length === 0 ? (
              <div className="p-space-lg bg-surface-container-low rounded-xl text-center text-outline">
                No doctors currently rostered for this shift. Emergency tele-triage is active.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                {availableDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-container shadow-xs flex flex-col justify-between gap-space-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono-data text-primary font-bold uppercase">
                          Room {doc.roomNo}
                        </span>
                        <span className="px-2 py-0.5 bg-primary-container/20 text-primary rounded text-[10px] font-bold">
                          Available Today
                        </span>
                      </div>
                      <h3 className="font-headline-sm font-bold text-on-surface">{doc.name}</h3>
                      <p className="font-body-sm text-secondary font-medium">{doc.specialty}</p>
                      <p className="text-[11px] text-outline mt-1">
                        Timings: 11:00 AM - 03:00 PM
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                      <div className="text-[11px] font-mono-data">
                        <span className="text-outline">Serving: </span>
                        <span className="font-bold text-primary">#{doc.currentToken}</span>
                      </div>
                      <button
                        onClick={() => handleBookDoctorDirectly(doc)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                        Book Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Available Diagnostic Tests Section */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">biotech</span>
              <h2 className="font-headline-md font-bold text-on-surface">{t.patientAvailableTests}</h2>
            </div>

            {availableDiagnostics.length === 0 ? (
              <div className="p-space-lg bg-surface-container-low rounded-xl text-center text-outline">
                Basic screening tests available on-site. Specialized tests are routed to the central hub.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-sm">
                {availableDiagnostics.map((test) => (
                  <div
                    key={test.id}
                    className="bg-surface-container-lowest p-space-sm rounded-xl border border-surface-container shadow-xs flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono-data uppercase text-outline block">
                        {test.category}
                      </span>
                      <h4 className="font-label-md font-bold text-on-surface mt-0.5">{test.name}</h4>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-surface-container">
                      <span className="text-[11px] font-bold text-primary">
                        {test.isFree ? '100% Free' : 'Subsidized'}
                      </span>
                      <span className="text-[11px] text-outline">
                        ~{Math.round(test.turnaroundHours * 60)}m Result
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Smart Multilingual Patient Symptom Assistant */}
          <section className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-md border border-surface-container flex flex-col gap-space-md">
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
              <div>
                <h3 className="font-headline-sm font-bold text-on-surface">{t.patientTriageTitle}</h3>
                <p className="font-body-sm text-outline">
                  Not sure which department to visit? Describe your symptoms in your own words.
                </p>
              </div>
            </div>

            <form onSubmit={handleSymptomTriage} className="flex flex-col sm:flex-row gap-space-sm">
              <input
                type="text"
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder={t.patientTriagePlaceholder}
                className="flex-1 px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-body-md text-on-surface focus:outline-none focus:border-tertiary"
              />
              <button
                type="submit"
                disabled={triageLoading}
                className="px-6 py-2.5 bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60"
              >
                {triageLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    {t.patientTriageBtn}
                  </>
                )}
              </button>
            </form>

            {triageAdvice && (
              <div className="bg-surface-container-low p-space-md rounded-xl border border-surface-container flex flex-col gap-space-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-primary font-bold">
                    Recommended Department: {triageAdvice.recommendedDepartment}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    triageAdvice.urgencyLevel === 'Emergency'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-primary-container text-on-primary-container'
                  }`}>
                    Urgency: {triageAdvice.urgencyLevel}
                  </span>
                </div>
                <p className="font-body-sm text-on-surface leading-relaxed mt-1">
                  {triageAdvice.guidance}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSymptomsInput('');
                      setActiveMode('booking');
                    }}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    Book Appointment for this Department
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
