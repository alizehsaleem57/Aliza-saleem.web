import React, { useState } from 'react';
import { Role, Language } from '../types';
import { translations } from '../i18n/translations';

interface HeaderProps {
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenCodeInspector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onChangeRole,
  language,
  onChangeLanguage,
  unreadCount,
  onOpenNotifications,
  onOpenCodeInspector,
}) => {
  const t = translations[language] || translations.en;
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const getRoleDisplayName = (r: Role) => {
    switch (r) {
      case 'cmo_district':
        return t.roleCMO;
      case 'hospital_public':
        return t.rolePublicHospital;
      case 'hospital_chronicle':
        return t.roleChronicle;
      case 'patient':
        return t.rolePatient;
      default:
        return 'District User';
    }
  };

  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'cmo_district':
        return 'CMO · District Health Mission';
      case 'hospital_public':
        return 'Hospital Admin · Public Hospital';
      case 'hospital_chronicle':
        return 'Center Admin · Chronicle Health';
      case 'patient':
        return 'Citizen / Patient Portal';
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg border-b border-surface-container">
      {/* Left telemetry indicators */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-space-xs rounded-full">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
            {t.liveTelemetry}
          </span>
        </div>
        <div className="hidden xl:flex items-center gap-space-xs text-on-surface-variant bg-surface-container-low px-space-sm py-space-xs rounded-lg border border-surface-container">
          <span className="material-symbols-outlined text-[16px] text-secondary">hub</span>
          <span className="font-body-sm text-body-sm font-medium">{t.commandNetwork}</span>
        </div>
      </div>

      {/* Right controls: Code Viewer, Language Switcher, Alerts, Role Selector */}
      <div className="flex items-center gap-space-md">
        {/* Code View & Download Button */}
        <button
          onClick={onOpenCodeInspector}
          className="flex items-center gap-1.5 px-space-sm py-space-xs bg-surface-container-low hover:bg-surface-container text-primary border border-primary/20 rounded-lg text-label-sm font-label-sm font-bold transition-all shadow-xs"
          title="Inspect, copy, and download project code"
        >
          <span className="material-symbols-outlined text-[16px]">code</span>
          <span className="hidden sm:inline">Inspect & Download Code</span>
        </button>

        {/* Multilingual Switcher */}
        <div className="inline-flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container">
          {(['en', 'hi', 'bn', 'ta'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onChangeLanguage(l)}
              className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-all ${
                language === l
                  ? 'bg-surface-container-lowest shadow-sm font-bold text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : l === 'bn' ? 'বাংলা' : 'தமிழ்'}
            </button>
          ))}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-space-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-full transition-colors"
          title="Active Escalations & Alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-label-sm text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-8 w-px bg-surface-container-high"></div>

        {/* Role & Facility Profile Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="flex flex-col text-right">
              <span className="font-label-md text-label-md text-on-surface font-semibold max-w-[200px] truncate">
                {currentRole === 'cmo_district'
                  ? 'Dr. Ananya Sharma'
                  : currentRole === 'hospital_public'
                  ? 'a public hospital'
                  : currentRole === 'hospital_chronicle'
                  ? 'Chronicle Health Center'
                  : 'Citizen / Patient'}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant max-w-[200px] truncate">
                {getRoleBadge(currentRole)}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              currentRole === 'patient' ? 'bg-secondary' : 'bg-primary'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {currentRole === 'patient' ? 'family_restroom' : 'person'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">
              arrow_drop_down
            </span>
          </button>

          {/* Role Dropdown */}
          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-surface-container mb-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block">
                  Select User Context & Access Role
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  Role-based permissions filter dashboard access
                </span>
              </div>

              {([
                { id: 'cmo_district' as Role, label: 'Dr. Ananya Sharma', sub: 'CMO · Full District 50 Facilities & Command Matrix', icon: 'shield_person' },
                { id: 'hospital_public' as Role, label: 'a public hospital Staff', sub: 'Authorized Hospital View (180 Beds)', icon: 'local_hospital' },
                { id: 'hospital_chronicle' as Role, label: 'Chronicle Health Center Staff', sub: 'Authorized CHC View (60 Beds)', icon: 'domain' },
                { id: 'patient' as Role, label: 'Patient / Public Citizen', sub: 'Restricted View (Doctors & Tests Only)', icon: 'person_search' }
              ]).map((roleOpt) => (
                <button
                  key={roleOpt.id}
                  onClick={() => {
                    onChangeRole(roleOpt.id);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                    currentRole === roleOpt.id
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                    currentRole === roleOpt.id ? 'text-on-primary-container' : 'text-primary'
                  }`}>
                    {roleOpt.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md leading-tight">{roleOpt.label}</span>
                    <span className={`font-body-sm text-[11px] mt-0.5 ${
                      currentRole === roleOpt.id ? 'text-on-primary-container/80' : 'text-on-surface-variant'
                    }`}>
                      {roleOpt.sub}
                    </span>
                  </div>
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-surface-container px-2">
                <p className="text-[10px] text-outline leading-normal">
                  * Note: As per challenge requirements, internal redistribution dashboards are accessible only to authorized district and hospital staff. Patients have isolated access to available doctors and diagnostics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
