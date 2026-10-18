import React from 'react';
import { NavTab, Language } from '../types';
import { translations } from '../i18n/translations';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: Language;
  crisisOverride: boolean;
  onToggleCrisis: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  crisisOverride,
  onToggleCrisis,
}) => {
  const t = translations[language] || translations.en;

  const navItems = [
    {
      id: 'district-overview' as NavTab,
      label: t.tabOverview,
      sublabel: t.tabOverviewSub,
      icon: 'grid_view',
    },
    {
      id: 'stock-and-medicines' as NavTab,
      label: t.tabStock,
      sublabel: t.tabStockSub,
      icon: 'medication',
    },
    {
      id: 'footfall-and-bed-grid' as NavTab,
      label: t.tabBeds,
      sublabel: t.tabBedsSub,
      icon: 'single_bed',
    },
    {
      id: 'doctor-roster' as NavTab,
      label: t.tabDoctors,
      sublabel: t.tabDoctorsSub,
      icon: 'badge',
    },
    {
      id: 'diagnostic-audit' as NavTab,
      label: t.tabDiagnostics,
      sublabel: t.tabDiagnosticsSub,
      icon: 'biotech',
    },
    {
      id: 'book-appointment' as NavTab,
      label: language === 'hi' ? 'मरीज अपॉइंटमेंट' : 'Patient OPD Booking',
      sublabel: language === 'hi' ? 'कैलेंडर व भोपाल डॉक्टर' : 'Doctor & Calendar (11 AM - 3 PM)',
      icon: 'calendar_month',
      highlight: false
    },
    {
      id: 'problem-statement' as NavTab,
      label: t.tabProblem,
      sublabel: t.tabProblemSub,
      icon: 'crisis_alert',
      highlight: true
    },
    {
      id: 'ai-assistant' as NavTab,
      label: t.tabAssistant,
      sublabel: t.tabAssistantSub,
      icon: 'smart_toy',
    }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-surface-container">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-low border-b border-surface-container">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">local_hospital</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">PulseGrid</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">District Health OS</span>
          </div>
        </div>

        {/* Operational Jurisdiction Capsule */}
        <div className="p-space-md">
          <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                {t.jurisdiction}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <span className="font-label-md text-label-md text-on-surface font-bold">{t.jurisdictionDistrict}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{t.facilitiesCount}</span>
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex flex-col px-space-md gap-space-xs">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-space-sm px-space-md py-space-sm transition-all rounded-lg text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : item.highlight
                    ? 'text-error bg-error-container/20 hover:bg-error-container/40'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-on-primary-container' : item.highlight ? 'text-error' : 'text-primary'}`}>
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md whitespace-nowrap">{item.label}</span>
                  <span className={`font-body-sm text-body-sm ${isActive ? 'text-on-primary-container/80' : 'text-outline'} whitespace-nowrap`}>
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest border-t border-surface-container">
        {/* Crisis Override Switch */}
        <div className={`p-space-sm rounded-lg flex items-center justify-between border transition-colors ${
          crisisOverride ? 'bg-error-container border-error text-on-error-container' : 'bg-surface-container-low border-surface-container'
        }`}>
          <div className="flex items-center gap-space-xs">
            <span className={`material-symbols-outlined text-[18px] ${crisisOverride ? 'text-error animate-pulse' : 'text-outline'}`}>
              crisis_alert
            </span>
            <span className="font-label-sm text-label-sm font-bold">
              {t.crisisOverride}
            </span>
          </div>
          <button
            onClick={onToggleCrisis}
            aria-label="Toggle Crisis Override"
            className={`w-8 h-4 rounded-full relative cursor-pointer flex items-center p-0.5 transition-colors ${
              crisisOverride ? 'bg-error' : 'bg-outline-variant'
            }`}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                crisisOverride ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Telemetry Status Line */}
        <div className="flex items-center gap-space-xs text-on-surface-variant px-space-xs">
          <span className="material-symbols-outlined text-[16px] text-primary">dns</span>
          <span className="font-mono-data text-mono-data font-medium">{t.telemetrySync}</span>
        </div>
      </div>
    </aside>
  );
};
