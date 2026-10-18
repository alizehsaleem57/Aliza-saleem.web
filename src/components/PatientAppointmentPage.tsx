import React, { useState } from 'react';
import { Facility, Doctor, Appointment } from '../types';

interface PatientAppointmentPageProps {
  facilities: Facility[];
  doctors: Doctor[];
  initialDisease?: string;
  initialHospitalId?: string;
  initialDoctorId?: string;
}

export const PatientAppointmentPage: React.FC<PatientAppointmentPageProps> = ({
  facilities,
  doctors,
  initialDisease = '',
  initialHospitalId = '',
  initialDoctorId = '',
}) => {
  // Language toggle: default English, convertible to Hindi
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Form states
  const [disease, setDisease] = useState(initialDisease || 'Fever & Viral Infection');
  const [customDisease, setCustomDisease] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(initialHospitalId || 'fac-01'); // Hamidia Hospital
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || 'doc-01'); // Dr. Rajesh Gaur

  // Calendar states (First requirement when booking)
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Default selected date: Tomorrow or Today
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateStr(tomorrow));
  const [isEditingCalendar, setIsEditingCalendar] = useState<boolean>(true);

  // Time slot strictly between 11:00 AM and 3:00 PM
  const allowedTimeSlots = [
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
  ];
  const [selectedTime, setSelectedTime] = useState<string>('11:30 AM');

  // Patient personal details
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [abhaId, setAbhaId] = useState('');

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Common diseases / health problems
  const commonDiseases = [
    { en: 'Fever & Viral Infection', hi: 'बुखार एवं वायरल संक्रमण' },
    { en: 'Cough, Cold & Breathing Issue', hi: 'खांसी, जुकाम व सांस की समस्या' },
    { en: 'Diabetes & Blood Pressure', hi: 'मधुमेह एवं उच्च रक्तचाप' },
    { en: 'Pregnancy & Maternal Health', hi: 'गर्भावस्था एवं मातृ स्वास्थ्य' },
    { en: 'Child Care & Infant Illness', hi: 'बाल रोग एवं शिशु स्वास्थ्य' },
    { en: 'Heart & Chest Pain', hi: 'हृदय एवं सीने में दर्द' },
    { en: 'Bone, Joint & Back Pain', hi: 'हड्डी, जोड़ व पीठ दर्द' },
    { en: 'Stomach Pain & Digestion', hi: 'पेट दर्द एवं पाचन समस्या' },
    { en: 'Skin Rash & Allergy', hi: 'त्वचा पर चकत्ते व एलर्जी' },
    { en: 'Eye & Vision Problem', hi: 'आंख एवं दृष्टि समस्या' },
  ];

  // Only Bhopal government hospitals and health centres
  const bhopalHospitals = facilities.filter((f) =>
    f.sector.toLowerCase().includes('bhopal') ||
    f.name.toLowerCase().includes('bhopal') ||
    f.name.toLowerCase().includes('hamidia') ||
    f.name.toLowerCase().includes('aiims') ||
    f.name.toLowerCase().includes('katju') ||
    f.name.toLowerCase().includes('kolar') ||
    f.name.toLowerCase().includes('misrod') ||
    f.name.toLowerCase().includes('karond')
  );

  const activeHospital = bhopalHospitals.find((h) => h.id === selectedHospitalId) || bhopalHospitals[0];

  // Doctors in the chosen Bhopal hospital
  const hospitalDoctors = doctors.filter((d) => d.facilityId === activeHospital.id);
  const activeDoctor = hospitalDoctors.find((d) => d.id === selectedDoctorId) || hospitalDoctors[0] || doctors[0];

  const isDoctorAvailable = activeDoctor ? activeDoctor.status !== 'absent' : false;

  // Calendar helpers
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesHi = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formatted);
    setIsEditingCalendar(false); // Can be edited again with "Edit Date" button
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert(lang === 'en' ? 'Please enter patient name' : 'कृपया मरीज का नाम दर्ज करें');
      return;
    }

    const newAppointment: Appointment = {
      id: `BPL-OPD-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName.trim(),
      mobileNumber: mobileNumber.trim() || '98260XXXXX',
      age: Number(patientAge) || 30,
      gender: patientGender,
      disease: customDisease.trim() || disease,
      hospitalId: activeHospital.id,
      hospitalName: activeHospital.name,
      hospitalAddress: activeHospital.sector,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      doctorSpecialty: activeDoctor.specialty,
      roomNo: activeDoctor.roomNo,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      tokenNumber: Math.floor(12 + Math.random() * 45),
      status: 'Confirmed',
      createdAt: new Date().toLocaleTimeString(),
    };

    setConfirmedBooking(newAppointment);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8 pb-24">
      {/* Top Header & Language Switcher */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {lang === 'en'
              ? 'Government Healthcare Services · Bhopal (Madhya Pradesh)'
              : 'सरकारी स्वास्थ्य सेवाएं · भोपाल (मध्य प्रदेश)'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            {lang === 'en'
              ? 'Book OPD Doctor Appointment'
              : 'ओपीडी डॉक्टर अपॉइंटमेंट बुक करें'}
          </h1>
          <p className="text-sm text-outline mt-1">
            {lang === 'en'
              ? 'Select your disease, Bhopal government hospital, doctor, and choose an available date & time (11 AM to 3 PM).'
              : 'अपनी बीमारी, भोपाल का सरकारी अस्पताल, डॉक्टर चुनें और 11 AM से 3 PM के बीच तारीख व समय तय करें।'}
          </p>
        </div>

        {/* Language Switcher Button */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1.5 rounded-xl border border-surface-container shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'en'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              lang === 'hi'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* Confirmation Slip Screen (if booked) */}
      {confirmedBooking ? (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg border-2 border-primary flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex items-start justify-between border-b border-surface-container pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase">
                  {lang === 'en' ? 'Appointment Confirmed' : 'अपॉइंटमेंट सफलतापूर्वक बुक हो गया'}
                </span>
                <h2 className="text-2xl font-bold text-on-surface">
                  Token #{confirmedBooking.tokenNumber} · {confirmedBooking.id}
                </h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-on-primary">
              100% Free Government OPD
            </span>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-5 rounded-xl border border-surface-container text-sm">
            <div>
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Patient Name' : 'मरीज का नाम'}
              </span>
              <span className="font-bold text-base text-on-surface">
                {confirmedBooking.patientName} ({confirmedBooking.age} yrs, {confirmedBooking.gender})
              </span>
            </div>

            <div>
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Disease / Problem' : 'बीमारी / समस्या'}
              </span>
              <span className="font-bold text-base text-on-surface">
                {confirmedBooking.disease}
              </span>
            </div>

            <div>
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Government Hospital (Bhopal)' : 'सरकारी अस्पताल (भोपाल)'}
              </span>
              <span className="font-bold text-base text-on-surface">
                {confirmedBooking.hospitalName}
              </span>
              <span className="text-xs text-outline block">{confirmedBooking.hospitalAddress}</span>
            </div>

            <div>
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Assigned Doctor' : 'चिकित्सक'}
              </span>
              <span className="font-bold text-base text-primary">
                {confirmedBooking.doctorName}
              </span>
              <span className="text-xs text-outline block">
                {confirmedBooking.doctorSpecialty} · {confirmedBooking.roomNo}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-primary/20">
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Confirmed Date' : 'तय की गई तारीख'}
              </span>
              <span className="font-bold text-lg text-primary">
                📅 {confirmedBooking.appointmentDate}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-lg border border-primary/20">
              <span className="text-xs text-outline font-semibold uppercase block">
                {lang === 'en' ? 'Doctor Consultation Timing' : 'डॉक्टर से मिलने का समय'}
              </span>
              <span className="font-bold text-lg text-secondary">
                ⏰ {confirmedBooking.appointmentTime} (Between 11:00 AM - 3:00 PM)
              </span>
            </div>
          </div>

          {/* Action Buttons on Slip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setIsEditingCalendar(true);
                setConfirmedBooking(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
              {lang === 'en' ? 'Edit / Reschedule Date on Calendar' : 'कैलेंडर पर तारीख बदलें / पुनर्निर्धारित करें'}
            </button>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-secondary text-white font-bold text-sm shadow hover:bg-secondary/90 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              {lang === 'en' ? 'Print OPD Slip' : 'पर्ची प्रिंट करें'}
            </button>
          </div>
        </div>
      ) : (
        /* Booking Step-by-Step Form */
        <form onSubmit={handleBookAppointment} className="flex flex-col gap-8">
          {/* STEP 1: Select Disease / Health Problem */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                {lang === 'en' ? 'Select or Enter Your Disease / Problem' : 'अपनी बीमारी या स्वास्थ्य समस्या चुनें या लिखें'}
              </h2>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {commonDiseases.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setDisease(item.en);
                    setCustomDisease('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    disease === item.en && !customDisease
                      ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container hover:bg-surface-container'
                  }`}
                >
                  {lang === 'en' ? item.en : item.hi}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-outline uppercase block mb-1">
                {lang === 'en'
                  ? 'Or describe your symptoms in words:'
                  : 'या अपनी बीमारी / लक्षण यहां लिखें:'}
              </label>
              <input
                type="text"
                placeholder={lang === 'en' ? 'e.g. Dengue fever, Knee pain, Blood sugar check...' : 'उदा. तेज बुखार, जोड़ों में दर्द, शुगर जांच...'}
                value={customDisease}
                onChange={(e) => setCustomDisease(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
          </div>

          {/* STEP 2: Select Bhopal Government Hospital / Center */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                {lang === 'en'
                  ? 'Select Government Hospital or Health Centre in Bhopal'
                  : 'भोपाल का सरकारी अस्पताल या स्वास्थ्य केंद्र चुनें'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bhopalHospitals.slice(0, 8).map((hosp) => {
                const isSelected = hosp.id === selectedHospitalId;
                return (
                  <div
                    key={hosp.id}
                    onClick={() => {
                      setSelectedHospitalId(hosp.id);
                      // Auto-select first doctor in this hospital
                      const doc = doctors.find((d) => d.facilityId === hosp.id);
                      if (doc) setSelectedDoctorId(doc.id);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono-data font-bold uppercase text-primary">
                          {hosp.type}
                        </span>
                        <span className="text-[11px] text-outline">
                          {hosp.distanceKmFromCenter} km
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-on-surface">{hosp.name}</h3>
                      <p className="text-xs text-outline">{hosp.sector}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
                      <span className="text-primary font-semibold">
                        {hosp.bedsTotal} Beds · OPD Open
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Doctor Selection & Availability Status */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                {lang === 'en'
                  ? `Doctors in ${activeHospital.name}`
                  : `${activeHospital.name} में उपलब्ध डॉक्टर`}
              </h2>
            </div>

            {hospitalDoctors.length === 0 ? (
              <p className="text-sm text-outline p-4 bg-surface-container-low rounded-xl">
                {lang === 'en'
                  ? 'All doctors at this centre are on duty. Please proceed to calendar.'
                  : 'इस केंद्र पर सभी डॉक्टर ड्यूटी पर उपलब्ध हैं।'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospitalDoctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  const isAvail = doc.status !== 'absent';
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs'
                          : 'border-surface-container bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-outline font-medium">{doc.roomNo}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAvail
                                ? 'bg-primary-container text-on-primary-container'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            {isAvail
                              ? lang === 'en' ? 'Available' : 'उपलब्ध'
                              : lang === 'en' ? 'Not Available' : 'अनुपस्थित'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-on-surface">{doc.name}</h3>
                        <p className="text-xs text-secondary font-medium">{doc.specialty}</p>
                      </div>

                      <div className="text-[11px] text-outline pt-2 border-t border-surface-container flex items-center justify-between">
                        <span>{lang === 'en' ? 'Consultation Hours:' : 'परामर्श समय:'} 11 AM - 3 PM</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            check_circle
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prompt when Doctor is Available */}
            {isDoctorAvailable ? (
              <div className="bg-primary-container/10 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">
                  event_available
                </span>
                <div>
                  <h4 className="font-bold text-sm text-primary">
                    {lang === 'en'
                      ? `${activeDoctor.name} is available in ${activeHospital.name}!`
                      : `${activeDoctor.name} अस्पताल में उपलब्ध हैं!`}
                  </h4>
                  <p className="text-xs text-on-surface mt-0.5">
                    {lang === 'en'
                      ? 'Please use the interactive calendar below to choose your desired date and pick an available timing slot between 11:00 AM and 3:00 PM.'
                      : 'कृपया नीचे दिए गए कैलेंडर से अपनी इच्छानुसार तारीख चुनें और 11:00 AM से 3:00 PM के बीच समय चुनें।'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-error-container/20 p-4 rounded-xl border border-error/30 text-xs text-error font-medium">
                {lang === 'en'
                  ? 'This doctor is temporarily unavailable. Please select another doctor from the list above.'
                  : 'यह डॉक्टर वर्तमान में अनुपस्थित हैं। कृपया ऊपर सूची से दूसरे डॉक्टर का चयन करें।'}
              </div>
            )}
          </div>

          {/* STEP 4: FIRSTLY GIVE THE CALENDAR (Editable) */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {lang === 'en'
                      ? 'Select Date on the Calendar'
                      : 'कैलेंडर से अपनी सुविधानुसार तारीख चुनें'}
                  </h2>
                  <p className="text-xs text-outline">
                    {lang === 'en'
                      ? 'Click on any date to choose or edit your appointment day.'
                      : 'अपॉइंटमेंट की तारीख तय करने या बदलने के लिए किसी भी तारीख पर क्लिक करें।'}
                  </p>
                </div>
              </div>

              {/* Editable date indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  📅 {lang === 'en' ? 'Selected:' : 'चयनित:'} {selectedDate}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingCalendar(true)}
                  className="text-xs text-secondary font-semibold hover:underline"
                >
                  {lang === 'en' ? 'Edit Date' : 'तारीख बदलें'}
                </button>
              </div>
            </div>

            {/* Editable Calendar View */}
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container">
              {/* Month Header with Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                <h3 className="font-bold text-base text-on-surface">
                  {lang === 'en' ? monthNamesEn[currentMonth] : monthNamesHi[currentMonth]} {currentYear}
                </h3>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-outline mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={i} className="py-1">
                    {lang === 'hi'
                      ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'][i]
                      : d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty prefix slots */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10"></div>
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateObj = new Date(currentYear, currentMonth, day);
                  const isPast =
                    dateObj.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                  const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === formatted;
                  const isSunday = dateObj.getDay() === 0;

                  return (
                    <button
                      type="button"
                      key={day}
                      disabled={isPast || isSunday}
                      onClick={() => handleDateSelect(day)}
                      className={`h-11 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-primary text-on-primary font-bold shadow-sm scale-105 z-10'
                          : isPast || isSunday
                          ? 'text-outline/40 cursor-not-allowed bg-transparent'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      <span>{day}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-outline mt-3 pt-2 border-t border-surface-container">
                <span>* {lang === 'en' ? 'Sundays OPD is closed for routine checkups' : 'रविवार को सामान्य ओपीडी बंद रहती है'}</span>
                <span className="text-primary font-semibold">
                  {lang === 'en' ? 'Click any date to edit' : 'बदलने के लिए तारीख पर क्लिक करें'}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 5: TIME SLOTS BETWEEN 11:00 AM AND 3:00 PM */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    {lang === 'en'
                      ? 'Select Consultation Time Slot (11:00 AM to 3:00 PM)'
                      : 'डॉक्टर से परामर्श का समय चुनें (11:00 AM से 3:00 PM)'}
                  </h2>
                  <p className="text-xs text-outline">
                    {lang === 'en'
                      ? `Doctor ${activeDoctor.name} is strictly available between 11:00 AM and 3:00 PM.`
                      : `डॉक्टर ${activeDoctor.name} केवल सुबह 11:00 बजे से दोपहर 3:00 बजे तक उपलब्ध हैं।`}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant">
                11 AM - 3 PM
              </span>
            </div>

            {/* Time slot chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {allowedTimeSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`p-3 rounded-xl text-xs font-bold text-center border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary shadow-sm scale-102'
                        : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 6: Patient Contact & Confirm */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center">
                6
              </span>
              <h2 className="text-lg font-bold text-on-surface">
                {lang === 'en' ? 'Patient Personal Details' : 'मरीज की जानकारी'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-outline uppercase block mb-1">
                  {lang === 'en' ? 'Patient Full Name *' : 'मरीज का पूरा नाम *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'Enter patient name' : 'मरीज का नाम लिखें'}
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-outline uppercase block mb-1">
                  {lang === 'en' ? 'Mobile Number (for SMS token)' : 'मोबाइल नंबर (एसएमएस हेतु)'}
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9826012345"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-outline uppercase block mb-1">
                    {lang === 'en' ? 'Age' : 'उम्र'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-outline uppercase block mb-1">
                    {lang === 'en' ? 'Gender' : 'लिंग'}
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-on-surface focus:outline-none"
                  >
                    <option value="Male">{lang === 'en' ? 'Male' : 'पुरुष'}</option>
                    <option value="Female">{lang === 'en' ? 'Female' : 'महिला'}</option>
                    <option value="Other">{lang === 'en' ? 'Other' : 'अन्य'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-outline uppercase block mb-1">
                  {lang === 'en' ? 'Ayushman Bharat / ABHA ID (Optional)' : 'आयुष्मान भारत / आभा कार्ड नंबर (वैकल्पिक)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14-digit ABHA ID"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-outline">
                {lang === 'en'
                  ? 'Consultations, essential medicines, and diagnostic lab tests are completely free.'
                  : 'सरकारी अस्पताल में परामर्श, आवश्यक दवाइयां एवं जांच 100% निशुल्क हैं।'}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                {lang === 'en'
                  ? 'Confirm & Book OPD Appointment'
                  : 'ओपीडी अपॉइंटमेंट पक्का करें'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
