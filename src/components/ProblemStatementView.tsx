import React from 'react';
import { Language } from '../types';

interface ProblemStatementViewProps {
  language: Language;
  onExploreDashboard: () => void;
}

export const ProblemStatementView: React.FC<ProblemStatementViewProps> = ({
  onExploreDashboard,
}) => {
  const challenges = [
    {
      title: "Medicine Stock-Outs & Delayed Supplies",
      icon: "medication_liquid",
      stat: "40% PHCs",
      statDesc: "experience monthly essential drug stock-outs",
      reality: "Peripheral health centres often run out of vital antibiotics, IV fluids, and pediatric syrups. Health workers manually maintain register books, causing order requests to take 2-4 weeks to reach district headquarters.",
      solution: "PulseGrid tracks consumption velocity automatically, forecasts depletion 48h in advance, and algorithmically triggers health van dispatches from surplus hubs."
    },
    {
      title: "Impact on Women, Girls & Maternal Care",
      icon: "pregnant_woman",
      stat: "68% of Rural Deliveries",
      statDesc: "occur at PHCs & CHCs without emergency OB/GYN backup",
      reality: "Young mothers and adolescent girls travel miles to peripheral centres only to discover lack of iron/folic acid supplements, empty delivery beds, or absent female medical officers.",
      solution: "Real-time bed availability indicators, automated reliever gynaecologist alerts, and guaranteed cold-chain oxytocin inventory stabilization."
    },
    {
      title: "Unpredictable Doctor Attendance & Absenteeism",
      icon: "person_cancel",
      stat: "28-35% Absenteeism",
      statDesc: "reported across rural peripheral PHCs",
      reality: "Patients wait up to 4 hours in crowded queues only to find the consultation room locked. Unscheduled absenteeism forces desperate families into expensive, predatory private debt.",
      solution: "Biometric duty verification triggers automatic tele-triage consultations and auto-dispatches reliever specialists when absenteeism exceeds SLA thresholds."
    },
    {
      title: "Unmanaged Footfall & Bed Saturation",
      icon: "domain_disabled",
      stat: "140% Peak Squeeze",
      statDesc: "overflowing referral centres while adjacent PHCs have empty beds",
      reality: "Patients bypass peripheral PHCs due to lack of trust, creating massive bottlenecks at secondary CHCs while beds and staff in nearby sectors sit underutilized.",
      solution: "Dynamic lateral transfer protocols and patient queue transparency that balances district admissions before saturation becomes fatal."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-space-lg py-space-xl flex flex-col gap-space-xl">
      {/* Hero Banner */}
      <div className="bg-surface-container-low p-space-xl rounded-2xl border border-surface-container relative overflow-hidden">
        <div className="max-w-3xl flex flex-col gap-space-sm relative z-10">
          <span className="bg-error-container text-on-error-container px-space-sm py-space-xs rounded-full font-mono-data text-mono-data font-bold w-fit flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
            The Healthcare Operational Challenge
          </span>
          <h1 className="font-display-lg text-display-lg text-on-surface font-bold">
            The Recurring Operational Gaps in PHCs & CHCs
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Primary Health Centres (PHCs) and Community Health Centres (CHCs) form the backbone of public healthcare for over 70% of the population. Yet, they face chronic shortages, manual tracking delays, and operational blindspots that place the lives of women, girls, and rural citizens at risk.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreDashboard}
              className="px-space-lg py-space-sm bg-primary text-on-primary rounded-xl font-label-md font-bold shadow-md hover:bg-primary-container transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Inspect PulseGrid Autonomous Solution
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of the Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {challenges.map((c, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-surface-container flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">{c.icon}</span>
                </div>
                <div className="text-right">
                  <span className="font-metric-value text-[22px] text-error font-bold block">{c.stat}</span>
                  <span className="text-[11px] text-outline">{c.statDesc}</span>
                </div>
              </div>

              <h3 className="font-headline-md font-bold text-on-surface">{c.title}</h3>

              <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
                <span className="font-label-sm text-outline uppercase font-bold text-[11px] block mb-1">
                  The Ground Reality:
                </span>
                <p className="font-body-sm text-on-surface-variant leading-relaxed">{c.reality}</p>
              </div>
            </div>

            <div className="bg-primary-container/10 p-space-sm rounded-xl border border-primary/20">
              <span className="font-label-sm text-primary uppercase font-bold text-[11px] flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                The PulseGrid Engineering Solution:
              </span>
              <p className="font-body-sm text-on-surface font-medium leading-relaxed">{c.solution}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Impact on Women & Girls Highlight Box */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-md flex flex-col md:flex-row items-center gap-space-lg">
        <div className="w-20 h-20 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[44px]">shield_with_heart</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-headline-md font-bold text-on-surface">
            Safeguarding Adolescent Girls & Maternal Health
          </h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            In rural settings, adolescent girls facing severe nutritional anemia, menstrual hygiene disorders, and early maternal complications are hit hardest by unmonitored stock-outs of Iron-Folic Acid and Oxytocin. By eliminating manual delays and automating medicine redistribution via active district health vans, PulseGrid ensures no young woman is turned away empty-handed.
          </p>
        </div>
      </div>
    </div>
  );
};
