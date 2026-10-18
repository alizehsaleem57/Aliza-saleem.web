export type Role = 'cmo_district' | 'hospital_public' | 'hospital_chronicle' | 'patient';

export type Language = 'en' | 'hi' | 'bn' | 'ta';

export type NavTab = 
  | 'district-overview' 
  | 'stock-and-medicines' 
  | 'footfall-and-bed-grid' 
  | 'doctor-roster' 
  | 'diagnostic-audit'
  | 'problem-statement'
  | 'book-appointment'
  | 'ai-assistant';

export type FacilityStatus = 'optimal' | 'warning' | 'critical' | 'in-transit';

export interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'Civil Hospital';
  sector: string;
  bedsTotal: number;
  bedsOccupied: number;
  doctorCount: number;
  doctorsPresent: number;
  dailyFootfall: number;
  status: FacilityStatus;
  statusReason: string;
  stockRiskHours: number; // hours until first critical stock-out
  distanceKmFromCenter: number;
  solarBackupOnline: boolean;
  triageDelayMins: number;
  isSurplusHub?: boolean;
  specialtyAvailability: string[];
}

export interface MedicineItem {
  id: string;
  name: string;
  category: 'Antibiotic' | 'Respiratory' | 'Emergency' | 'Maternal' | 'Pediatric' | 'Chronic';
  currentUnits: number;
  bufferThreshold: number;
  burnRatePerDay: number;
  unit: string;
  status: 'Surplus' | 'Adequate' | 'Depleting' | 'Critical';
  facilityId: string;
  facilityName: string;
  hoursUntilDepletion: number;
  batchExpiryDate: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  facilityId: string;
  facilityName: string;
  status: 'on-duty' | 'leave' | 'absent' | 'tele-triage';
  shift: 'Morning (08:00 - 14:00)' | 'Evening (14:00 - 20:00)' | 'Night Emergency (20:00 - 08:00)';
  roomNo: string;
  currentToken: number;
  patientsInQueue: number;
  consecutiveAbsentDays?: number;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  category: 'Serology' | 'Hematology' | 'Biochemistry' | 'Maternal' | 'Rapid Test';
  facilityId: string;
  facilityName: string;
  available: boolean;
  reagentStockPct: number;
  turnaroundHours: number;
  isFree: boolean;
  dailyConducted: number;
}

export interface RedistributionDispatch {
  id: string;
  sourceHubId: string;
  sourceHubName: string;
  targetNodeId: string;
  targetNodeName: string;
  item: string;
  quantity: string;
  secondaryItem?: string;
  secondaryQuantity?: string;
  vanNumber: string;
  distanceKm: number;
  etaMins: number;
  status: 'Pending Authorization' | 'En Route' | 'Delivered';
  timestamp: string;
}

export interface EscalationNotice {
  id: string;
  facilityId: string;
  facilityName: string;
  type: 'CLINICAL_TRIAGE_LAG' | 'WORKFORCE_COMPLIANCE' | 'FACILITY_BOTTLENECK' | 'REAGENT_EXHAUSTION';
  severity: 'HIGH' | 'CRITICAL';
  metric: string;
  slaTarget: string;
  currentValue: string;
  actionTaken?: string;
  date: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  mobileNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  disease: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  roomNo: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // Between 11:00 AM and 3:00 PM
  tokenNumber: number;
  status: 'Confirmed' | 'Rescheduled' | 'Cancelled';
  createdAt: string;
}
