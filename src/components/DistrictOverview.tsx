import React, { useState, useEffect } from 'react';
import { Facility, Language, RedistributionDispatch } from '../types';
import { translations } from '../i18n/translations';

interface DistrictOverviewProps {
  language: Language;
  facilities: Facility[];
  dispatch: RedistributionDispatch;
  onAuthorizeDispatch: () => void;
  onOpenFacility: (facility: Facility) => void;
  onOpenShowCause: (facName: string) => void;
  onDeployReliever: (facName: string) => void;
  onAuthorizeTransfer: (facName: string) => void;
  onExportAudit: () => void;
  onInstantTriage: () => void;
  onSimulateRunaway: () => void;
  onModifyRoute: () => void;
  hospitalFilter?: string; // for hospital-specific views
}

export const DistrictOverview: React.FC<DistrictOverviewProps> = ({
  language,
  facilities,
  dispatch,
  onAuthorizeDispatch,
  onOpenFacility,
  onOpenShowCause,
  onDeployReliever,
  onAuthorizeTransfer,
  onExportAudit,
  onInstantTriage,
  onSimulateRunaway,
  onModifyRoute,
  hospitalFilter,
}) => {
  const t = translations[language] || translations.en;
  
  // Multilingual rotating tagline
  const phrases = [
    "वास्तविक समय जिला स्वास्थ्य प्रबंधन प्रणाली",
    "রিয়েল-টাইম জেলা স্বাস্থ্য ব্যবস্থাপনা ব্যবস্থা",
    "நிகழ்நேர மாவட்ட சுகாதார மேலாண்மை அமைப்பு",
    "Real-time District Health Operations & Autonomous Telemetry"
  ];
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [rotatorFade, setRotatorFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatorFade(true);
      setTimeout(() => {
        setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
        setRotatorFade(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  // Spatial grid filter
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'inflight' | 'surplus'>('all');

  const filteredFacilities = facilities.filter((f) => {
    if (hospitalFilter && f.name !== hospitalFilter) {
      // If scoped to a specific hospital
      return false;
    }
    if (activeFilter === 'critical') return f.status === 'critical';
    if (activeFilter === 'inflight') return f.status === 'in-transit' || f.name.includes('Kalyanpur') || f.name.includes('Rampur');
    if (activeFilter === 'surplus') return f.isSurplusHub;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Command Hero Canopy */}
      <section className="relative px-space-lg py-space-xl bg-surface-container-low overflow-hidden border-b border-surface-container">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg relative z-10">
          {/* Auxiliary Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-xs border border-surface-container">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="font-mono-data text-mono-data text-on-surface uppercase tracking-wider font-semibold">
                {t.engineVersion}
              </span>
            </div>

            {/* Localized Quick Banner */}
            <div className="flex items-center gap-space-sm bg-surface-container-high/80 backdrop-blur-md px-space-md py-space-xs rounded-full border border-surface-container">
              <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
              <div
                className={`font-label-sm text-label-sm text-on-surface-variant transition-opacity duration-300 ${
                  rotatorFade ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {phrases[currentPhraseIdx]}
              </div>
              <span className="text-outline-variant text-[11px] font-mono-data">| HIN · BEN · TAM</span>
            </div>
          </div>

          {/* Main Heading & Executive Summary */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div className="max-w-3xl flex flex-col gap-space-sm">
              <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-widest font-bold">
                <span className="material-symbols-outlined text-[18px]">emergency_home</span>
                {t.unifiedLayer}
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                {hospitalFilter ? `${hospitalFilter} Operations Console` : t.heroHeading}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                onClick={onExportAudit}
                className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-lowest hover:bg-surface-container text-secondary font-label-md text-label-md rounded-lg shadow-xs border border-surface-container transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                {t.exportMatrix}
              </button>
              <button
                onClick={onInstantTriage}
                className="flex items-center gap-space-xs px-space-md py-space-sm bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                {t.instantTriage}
              </button>
            </div>
          </div>

          {/* Top KPI Summary Banner (4 Stat Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-sm">
            {/* KPI 1: Active Facilities */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  {t.kpiFacilities}
                </span>
                <span className="p-space-xs rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-[20px]">domain</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-metric-value text-metric-value text-on-surface">50 / 50</span>
                  <span className="font-label-sm text-label-sm text-primary font-bold">98.4% Up</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.kpiFacilitiesSub}</p>
              </div>
              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
                <span className="font-mono-data text-mono-data text-outline">{t.kpiFacilitiesFooter}</span>
                <span className="inline-flex items-center text-primary font-mono-data text-mono-data font-semibold">Sync OK</span>
              </div>
            </div>

            {/* KPI 2: Bed Occupancy */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  {t.kpiBedOccupancy}
                </span>
                <span className="p-space-xs rounded-lg bg-error-container text-error">
                  <span className="material-symbols-outlined text-[20px]">airline_seat_flat</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-metric-value text-metric-value text-on-surface">89.2%</span>
                  <span className="font-label-sm text-label-sm text-error font-bold">{t.kpiCriticalLoad}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.kpiBedsSub}</p>
              </div>
              <div className="flex flex-col gap-1 pt-space-xs">
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full rounded-full transition-all duration-500" style={{ width: '89.2%' }}></div>
                </div>
                <span className="font-mono-data text-mono-data text-error font-semibold">{t.kpiSurgeWarning}</span>
              </div>
            </div>

            {/* KPI 3: Stock-out Risk */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  {t.kpiStockRisk}
                </span>
                <span className="p-space-xs rounded-lg bg-surface-container text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">medical_services</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-metric-value text-metric-value text-on-surface">7 Nodes</span>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">In &lt;48h</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.kpiStockSub}</p>
              </div>
              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
                <span className="font-mono-data text-mono-data text-tertiary font-semibold">{t.kpiStockReady}</span>
                <span className="material-symbols-outlined text-[16px] text-tertiary">route</span>
              </div>
            </div>

            {/* KPI 4: Doctor Coverage */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  {t.kpiDoctorRatio}
                </span>
                <span className="p-space-xs rounded-lg bg-surface-container text-secondary">
                  <span className="material-symbols-outlined text-[20px]">stethoscope</span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-metric-value text-metric-value text-on-surface">92.0%</span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">{t.kpiDoctorOnDuty}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.kpiDoctorSub}</p>
              </div>
              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container">
                <span className="font-mono-data text-mono-data text-outline">{t.kpiTeleTriage}</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-secondary"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Content Workspace */}
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto w-full flex flex-col gap-space-xl">
        {/* MODULE 1: AI-Driven Demand Forecast & Resource Redistribution Matrix */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs text-tertiary">
                <span className="material-symbols-outlined text-[20px]">neurology</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  {t.dispatchEngine}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {t.redistributionTitle}
              </h2>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-space-sm py-space-xs rounded-full font-mono-data text-mono-data flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                {t.routeOptimizerReady}
              </span>
            </div>
          </div>

          {/* Redistribution Matrix Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-lg relative overflow-hidden border border-surface-container">
            <div className="flex flex-col xl:flex-row items-stretch justify-between gap-space-lg">
              {/* Source Node (Surplus Hub #08) */}
              <div className="flex-1 bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-md border border-surface-container">
                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded font-mono-data text-mono-data font-bold border border-surface-container">
                      {t.sourceHub}
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary"></span> {t.surplusOptimal}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t.civilChcRampur}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.hubSector2}</p>
                </div>

                <div className="grid grid-cols-2 gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg shadow-xs border border-surface-container">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">{t.amoxStock}</span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {dispatch.status === 'En Route' ? '+1,700 vials' : '+3,200 vials'}
                    </span>
                    <span className="font-mono-data text-mono-data text-on-surface-variant">Surplus threshold: +180%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">{t.o2Stock}</span>
                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                      {dispatch.status === 'En Route' ? '+10 units' : '+14 units'}
                    </span>
                    <span className="font-mono-data text-mono-data text-on-surface-variant">Manifold pressure: 99.4%</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs text-on-surface-variant font-mono-data text-mono-data">
                  <span className="material-symbols-outlined text-[16px] text-secondary">local_shipping</span>
                  {dispatch.status === 'En Route'
                    ? 'Health Van Fleet #DHV-09 En Route to Kalyanpur'
                    : t.healthVanFleet}
                </div>
              </div>

              {/* Transfer Conduit Indicator */}
              <div className="flex flex-col items-center justify-center py-space-sm xl:py-0 px-space-md">
                <div className="hidden xl:flex flex-col items-center gap-2">
                  <span className="font-mono-data text-mono-data text-tertiary font-bold bg-tertiary/10 px-space-sm py-space-xs rounded-full">
                    {t.aiDispatchPipeline}
                  </span>
                  <div className="w-px h-12 bg-tertiary/30"></div>
                  <span className="material-symbols-outlined text-tertiary text-[28px] animate-pulse">arrow_forward</span>
                  <div className="w-px h-12 bg-tertiary/30"></div>
                  <span className="font-mono-data text-mono-data text-on-surface-variant font-semibold">{t.transferKm}</span>
                </div>
                <div className="flex xl:hidden items-center justify-center gap-space-sm w-full py-space-sm">
                  <div className="h-px bg-tertiary/30 flex-1"></div>
                  <span className="font-mono-data text-mono-data text-tertiary font-bold bg-tertiary/10 px-space-sm py-space-xs rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span> Heuristic Route #R-04
                  </span>
                  <div className="h-px bg-tertiary/30 flex-1"></div>
                </div>
              </div>

              {/* Target Node (Critical Need Periphery #31) */}
              <div className="flex-1 bg-error-container/40 rounded-xl p-space-md flex flex-col justify-between gap-space-md border border-error-container">
                <div>
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="bg-surface-container-lowest text-error px-space-xs py-0.5 rounded font-mono-data text-mono-data font-bold border border-surface-container">
                      {t.targetPeriphery}
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-error font-bold">
                      <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> {t.urgentStockout}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">{t.phcKalyanpur}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.kalyanpurSub}</p>
                </div>

                <div className="grid grid-cols-2 gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg shadow-xs border border-surface-container">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">{t.amoxStock}</span>
                    <span className="font-headline-sm text-headline-sm text-error font-bold">
                      {dispatch.status === 'En Route' ? '1,512 vials (Allocated)' : t.amoxLeft}
                    </span>
                    <span className="font-mono-data text-mono-data text-error font-semibold">
                      {dispatch.status === 'En Route' ? 'Replenishment: ETA 42m' : t.depletionHours}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-outline">{t.o2Stock}</span>
                    <span className="font-headline-sm text-headline-sm text-error font-bold">
                      {dispatch.status === 'En Route' ? '5 units (Allocated)' : t.o2UnitsLeft}
                    </span>
                    <span className="font-mono-data text-mono-data text-error font-semibold">
                      {dispatch.status === 'En Route' ? 'Depletion averted' : t.bufferZero}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs text-on-surface-variant font-mono-data text-mono-data">
                  <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                  {t.outpatientSurge}
                </div>
              </div>
            </div>

            {/* AI Recommendation Strip */}
            <div className="bg-surface-container-high/60 rounded-xl p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[24px] mt-0.5">psychology</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {t.algorithmicEngine}
                  </span>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {dispatch.status === 'En Route' ? (
                      <span className="text-primary font-bold">
                        ✓ Route #R-04 Dispatched: 1,500 vials Amoxicillin + 4 Type-D Oxygen Cylinders currently on District Health Van #DHV-09. Live GPS telemetry tracking active.
                      </span>
                    ) : (
                      t.recommendationText
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-xs w-full md:w-auto justify-end">
                <button
                  onClick={onSimulateRunaway}
                  className="px-space-md py-space-sm bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg shadow-xs border border-surface-container transition-all"
                >
                  {t.simulateRunaway}
                </button>
                <button
                  onClick={onModifyRoute}
                  className="px-space-md py-space-sm bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md rounded-lg shadow-xs border border-surface-container transition-all"
                >
                  {t.modifyRoute}
                </button>
                <button
                  onClick={onAuthorizeDispatch}
                  disabled={dispatch.status === 'En Route'}
                  className={`px-space-lg py-space-sm font-label-md text-label-md rounded-lg shadow-sm flex items-center gap-space-xs transition-all active:scale-95 ${
                    dispatch.status === 'En Route'
                      ? 'bg-primary text-on-primary cursor-default'
                      : 'bg-tertiary hover:bg-tertiary-container text-on-tertiary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {dispatch.status === 'En Route' ? 'done_all' : 'verified'}
                  </span>
                  {dispatch.status === 'En Route' ? t.authorizedSuccess : t.authorizeBtn}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE 2: Spatial Surveillance - District Map & Interactive Cluster Grid */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-[20px]">grid_goldenratio</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  {t.spatialSurveillance}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                {t.clusterTitle}
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-lowest p-1 rounded-lg shadow-xs border border-surface-container">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => setActiveFilter('critical')}
                className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-colors ${
                  activeFilter === 'critical'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t.filterCritical}
              </button>
              <button
                onClick={() => setActiveFilter('inflight')}
                className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-colors ${
                  activeFilter === 'inflight'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t.filterInflight}
              </button>
              <button
                onClick={() => setActiveFilter('surplus')}
                className={`px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm transition-colors ${
                  activeFilter === 'surplus'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t.filterSurplus}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
            {/* Visual Telemetry Network Map */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between relative min-h-[420px] overflow-hidden border border-surface-container">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">map</span>
                  <span className="font-label-md text-label-md text-on-surface font-bold">{t.topologicalMatrix}</span>
                </div>
                <div className="flex items-center gap-space-md font-mono-data text-mono-data">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {t.legendOptimal}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span> {t.legendInTransit}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span> {t.legendIntervention}
                  </span>
                </div>
              </div>

              {/* Abstract SVG Vector District Topology */}
              <div className="relative w-full h-72 my-space-sm flex items-center justify-center">
                <svg className="w-full h-full text-surface-container-high" fill="none" stroke="currentColor" viewBox="0 0 600 300">
                  {/* Route Lines */}
                  <path className="text-outline-variant" d="M 80 80 L 190 140 L 320 80 L 460 160 L 520 220" strokeDasharray="4 4" strokeWidth="2"></path>
                  <path className="text-outline-variant" d="M 190 140 L 220 230 L 360 210 L 460 160" strokeWidth="2"></path>
                  <path className="text-outline-variant" d="M 320 80 L 410 40 L 530 80" strokeDasharray="2 2" strokeWidth="2"></path>

                  {/* In-Flight Transfer Vector */}
                  <path className="text-tertiary" d="M 190 140 L 360 210" strokeDasharray="6 6" strokeWidth="3">
                    <animate attributeName="stroke-dashoffset" dur="2s" from="30" to="0" repeatCount="indefinite"></animate>
                  </path>

                  {/* Node 1: CHC Sadar */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-08')!)}>
                    <circle cx="80" cy="80" r="14" className="fill-surface-container-lowest text-primary" stroke="currentColor" strokeWidth="3"></circle>
                    <text x="80" y="60" textAnchor="middle" className="fill-on-surface font-mono-data text-[10px] font-bold">CHC Sadar</text>
                  </g>

                  {/* Node 2: Rampur (Surplus) */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-03')!)}>
                    <circle cx="190" cy="140" r="16" className="fill-primary text-surface-container-lowest" stroke="currentColor" strokeWidth="4"></circle>
                    <text x="190" y="172" textAnchor="middle" className="fill-on-surface font-mono-data text-[10px] font-bold">CHC Rampur [Surplus]</text>
                  </g>

                  {/* Node 3: Belsar (Warning) */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-05')!)}>
                    <circle cx="320" cy="80" r="12" className="fill-error text-surface-container-lowest" stroke="currentColor" strokeWidth="3"></circle>
                    <text x="320" y="62" textAnchor="middle" className="fill-error font-mono-data text-[10px] font-bold">PHC Belsar [Alert]</text>
                  </g>

                  {/* Node 4: Kalyanpur (Critical) */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-04')!)}>
                    <circle cx="360" cy="210" r="16" className="fill-error text-surface-container-lowest" stroke="currentColor" strokeWidth="4"></circle>
                    <circle cx="360" cy="210" r="22" fill="none" stroke="currentColor" strokeWidth="1" className="text-error animate-ping"></circle>
                    <text x="360" y="242" textAnchor="middle" className="fill-on-surface font-mono-data text-[10px] font-bold">PHC Kalyanpur [Receiving]</text>
                  </g>

                  {/* Node 5: Sonapur */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-06')!)}>
                    <circle cx="220" cy="230" r="12" className="fill-error-container text-error" stroke="currentColor" strokeWidth="3"></circle>
                    <text x="220" y="255" textAnchor="middle" className="fill-on-surface font-mono-data text-[10px]">PHC Sonapur</text>
                  </g>

                  {/* Node 6: Mohanpur */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-07')!)}>
                    <circle cx="460" cy="160" r="14" className="fill-error text-surface-container-lowest" stroke="currentColor" strokeWidth="3"></circle>
                    <text x="460" y="190" textAnchor="middle" className="fill-on-surface font-mono-data text-[10px]">CHC Mohanpur</text>
                  </g>

                  {/* Node 7: Garhi */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-09')!)}>
                    <circle cx="520" cy="220" r="10" className="fill-surface-container text-primary" stroke="currentColor" strokeWidth="2"></circle>
                    <text x="520" y="240" textAnchor="middle" className="fill-on-surface font-mono-data text-[9px]">PHC Garhi</text>
                  </g>

                  {/* Node 8: Mandi */}
                  <g className="cursor-pointer" onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-10')!)}>
                    <circle cx="410" cy="40" r="10" className="fill-surface-container text-primary" stroke="currentColor" strokeWidth="2"></circle>
                    <text x="410" y="30" textAnchor="middle" className="fill-on-surface font-mono-data text-[9px]">PHC Mandi</text>
                  </g>
                </svg>

                {/* Floating Live Status Overlay Panel */}
                <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur-md p-space-sm rounded-lg shadow-sm border border-surface-container max-w-xs">
                  <span className="font-label-sm text-label-sm text-outline uppercase block mb-1 font-bold">
                    {t.activePipelineRoute}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium">
                    {t.pipelineRouteText}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-space-xs border-t border-surface-container font-mono-data text-mono-data text-on-surface-variant">
                <span>District Coordinate Extent: 28.61° N, 77.20° E (Rad: 45km)</span>
                <span>Mesh Refresh Rate: 1000ms</span>
              </div>
            </div>

            {/* Visual Mini Cluster List */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between gap-space-md border border-surface-container">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {t.facilityPulseStream}
                </span>
                <span className="font-mono-data text-mono-data text-primary font-bold">
                  {t.live50Nodes}
                </span>
              </div>

              <div className="flex flex-col gap-space-sm overflow-y-auto max-h-[340px] pr-1">
                {/* Node Item 1 */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-04')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">PHC Kalyanpur</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 4 · Stock Exhaustion</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-error font-bold">Crit 0h</span>
                </div>

                {/* Node Item 2 */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-07')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">CHC Mohanpur</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 3 · Bed Saturated (100%)</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-error font-bold">Cap Saturated</span>
                </div>

                {/* Node Item 3 */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-03')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Civil CHC Rampur</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 2 · Primary Surplus Hub</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-primary font-bold">Stable</span>
                </div>

                {/* Node Item 4: a public hospital */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-01')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">a public hospital</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 1 · Referral Tertiary Node</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-primary font-bold">Online</span>
                </div>

                {/* Node Item 5: Chronicle Health Center */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-02')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Chronicle Health Center</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 2 · Maternity Throughput High</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-primary font-bold">Stable</span>
                </div>

                {/* Node Item 6: PHC Belsar */}
                <div
                  onClick={() => onOpenFacility(facilities.find(f => f.id === 'fac-05')!)}
                  className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between cursor-pointer border border-surface-container/50"
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-bold">PHC Belsar</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Sector 1 · Reagents Depleted</span>
                    </div>
                  </div>
                  <span className="font-mono-data text-mono-data text-error font-bold">Action Req</span>
                </div>
              </div>

              <button
                onClick={() => setActiveFilter('all')}
                className="w-full py-space-xs text-center font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors"
              >
                {t.viewAll50}
              </button>
            </div>
          </div>
        </section>

        {/* MODULE 3: District Health Vulnerability & Underperforming Facilities Radar */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs text-error">
                <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
                  {t.adminOversight}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                {t.vulnerabilityTitle}
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {t.dmReview}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Vulnerability Card 1: PHC Belsar */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between gap-space-md border border-surface-container border-l-4 border-l-error">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-mono-data text-mono-data font-bold">
                    CLINICAL TRIAGE LAG
                  </span>
                  <span className="material-symbols-outlined text-error text-[20px]">schedule</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">PHC Belsar</h3>
                <p className="font-body-sm text-body-sm text-outline">Sector 1 Peripheral · Ward #4</p>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs border border-surface-container">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Infant Triage Delay</span>
                  <span className="text-error font-bold">&gt;45 mins (SLA: 10m)</span>
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Malaria RDT Reagent</span>
                  <span className="text-error font-bold">0% Available</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
                  <div className="bg-error h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-error">assignment_late</span>
                  Flagged for DM unannounced inspection
                </div>
                <button
                  onClick={() => onOpenShowCause('PHC Belsar')}
                  className="w-full py-space-xs bg-error hover:bg-on-error-container text-on-error font-label-md text-label-md rounded-lg shadow-sm transition-all mt-1 active:scale-95"
                >
                  {t.showCauseNoticeBtn}
                </button>
              </div>
            </div>

            {/* Vulnerability Card 2: PHC Sonapur */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between gap-space-md border border-surface-container border-l-4 border-l-error">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-mono-data text-mono-data font-bold">
                    WORKFORCE COMPLIANCE
                  </span>
                  <span className="material-symbols-outlined text-error text-[20px]">person_off</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">PHC Sonapur</h3>
                <p className="font-body-sm text-body-sm text-outline">Sector 3 Rural Sub-division</p>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs border border-surface-container">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Cardiology Absenteeism</span>
                  <span className="text-error font-bold">4 Consecutive Days</span>
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Daily Turnaway Rate</span>
                  <span className="text-error font-bold">38 Outpatients</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
                  <div className="bg-error h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">transfer_within_a_station</span>
                  Auto-diverting triage to CHC Sadar
                </div>
                <button
                  onClick={() => onDeployReliever('PHC Sonapur')}
                  className="w-full py-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg shadow-sm transition-all mt-1 active:scale-95 border border-surface-container font-semibold"
                >
                  {t.deployRelieverBtn}
                </button>
              </div>
            </div>

            {/* Vulnerability Card 3: CHC Mohanpur */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md flex flex-col justify-between gap-space-md border border-surface-container border-l-4 border-l-error">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-mono-data text-mono-data font-bold">
                    FACILITY BOTTLENECK
                  </span>
                  <span className="material-symbols-outlined text-error text-[20px]">hotel</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">CHC Mohanpur</h3>
                <p className="font-body-sm text-body-sm text-outline">Sector 3 Referral Centre</p>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs border border-surface-container">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Bed Capacity Status</span>
                  <span className="text-error font-bold">100% Saturation</span>
                </div>
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Admission Queue</span>
                  <span className="text-error font-bold">18 Patients Waiting</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
                  <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
                  Rapid step-down discharge activated
                </div>
                <button
                  onClick={() => onAuthorizeTransfer('CHC Mohanpur')}
                  className="w-full py-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md rounded-lg shadow-sm transition-all mt-1 active:scale-95 border border-surface-container font-semibold"
                >
                  {t.authorizeTransfersBtn}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Footer Audit Indicator */}
        <div className="flex flex-wrap items-center justify-between p-space-md rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
            <span className="font-label-sm text-label-sm font-medium">
              Authenticated under National Health Digital Architecture (NDHM) Compliance Level 3
            </span>
          </div>
          <div className="flex items-center gap-space-md font-mono-data text-mono-data font-semibold">
            <span>Mesh Node Latency: 44ms</span>
            <span>Node ID: DHM-NC-9982</span>
          </div>
        </div>
      </div>
    </div>
  );
};
