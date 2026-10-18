import React, { useState } from 'react';
import { Doctor, Facility, Language } from '../types';

interface DoctorRosterProps {
  doctors: Doctor[];
  facilities: Facility[];
  language: Language;
  onDeployReliever: (facName: string) => void;
}

export const DoctorRoster: React.FC<DoctorRosterProps> = ({
  doctors,
  facilities,
  onDeployReliever,
}) => {
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const specialties = ['All', 'General Physician', 'Pediatrician', 'Obstetrics', 'Cardiologist', 'Emergency'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec =
      filterSpecialty === 'All' || doc.specialty.toLowerCase().includes(filterSpecialty.toLowerCase());
    const matchesStat = filterStatus === 'All' || doc.status === filterStatus;
    return matchesSpec && matchesStat;
  });

  const onDutyCount = doctors.filter((d) => d.status === 'on-duty').length;
  const absentCount = doctors.filter((d) => d.status === 'absent').length;

  return (
    <div className="max-w-7xl mx-auto px-space-lg py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-primary text-label-sm font-label-sm uppercase font-bold tracking-wider mb-1">
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Workforce Telemetry & Attendance Tracking
          </div>
          <h1 className="font-display-lg text-headline-lg text-on-surface font-bold">
            District Medical Officer Roster & Tele-Triage
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Biometric duty verification across 142 active medical professionals. Flags unnotified absenteeism and automatically activates tele-consultation or reliever doctor dispatch.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-space-sm">
          <div className="bg-surface-container-low text-primary px-space-md py-space-xs rounded-xl flex items-center gap-2 border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] font-bold uppercase">Doctors On Duty</span>
              <span className="font-metric-value text-[18px] leading-tight font-bold">{onDutyCount} Verified</span>
            </div>
          </div>
          <div className="bg-error-container text-on-error-container px-space-md py-space-xs rounded-xl flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-error text-[20px]">person_off</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] font-bold uppercase">Unnotified Absences</span>
              <span className="font-metric-value text-[18px] leading-tight font-bold">{absentCount} Flagged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-xs">
          <span className="font-label-sm text-outline uppercase font-semibold mr-1">Filter Specialty:</span>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setFilterSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-colors ${
                filterSpecialty === spec
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-sm text-outline uppercase font-semibold">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface-container-low border border-surface-container rounded-lg text-label-sm text-on-surface focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="on-duty">On Duty</option>
            <option value="absent">Absent / Flagged</option>
            <option value="tele-triage">Tele-Triage Active</option>
          </select>
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {filteredDoctors.map((doc) => {
          const isAbsent = doc.status === 'absent';
          const isTele = doc.status === 'tele-triage';

          return (
            <div
              key={doc.id}
              className={`bg-surface-container-lowest p-space-md rounded-xl shadow-xs border transition-all flex flex-col justify-between gap-space-md ${
                isAbsent ? 'border-error/40 bg-error-container/10' : 'border-surface-container'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono-data uppercase font-bold text-outline">
                    {doc.shift}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isAbsent
                        ? 'bg-error-container text-on-error-container'
                        : isTele
                        ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                        : 'bg-primary-container/20 text-primary'
                    }`}
                  >
                    {isAbsent ? 'Absent' : isTele ? 'Tele-Triage' : 'On-Duty'}
                  </span>
                </div>

                <h4 className="font-headline-sm font-bold text-on-surface">{doc.name}</h4>
                <p className="font-body-sm text-primary font-medium">{doc.specialty}</p>
                <p className="text-[12px] text-outline mt-1">{doc.facilityName} · {doc.roomNo}</p>
              </div>

              {/* Patient Queue & Token status */}
              <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-container flex items-center justify-between font-mono-data text-body-sm">
                <div>
                  <span className="text-[10px] text-outline uppercase block">Current Token</span>
                  <span className="font-bold text-on-surface text-[15px]">
                    {isAbsent ? 'HALTED' : `#${doc.currentToken}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase block">Queue Depth</span>
                  <span className={`font-bold text-[15px] ${isAbsent ? 'text-error' : 'text-on-surface'}`}>
                    {doc.patientsInQueue} waiting
                  </span>
                </div>
              </div>

              {isAbsent ? (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-error/20">
                  <span className="text-[11px] text-error font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {doc.consecutiveAbsentDays} days unnotified absence
                  </span>
                  <button
                    onClick={() => onDeployReliever(doc.facilityName)}
                    className="w-full py-1.5 bg-error text-on-error rounded-lg font-label-md text-label-md font-bold hover:bg-on-error-container transition-all"
                  >
                    Deploy Reliever Specialist
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-outline pt-1 border-t border-surface-container">
                  <span>Biometric Verified: 07:58 AM</span>
                  <span className="text-primary font-semibold">Active Roster</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
