export type CategoryType = 'water' | 'roads' | 'sanitation' | 'health' | 'education' | 'rates' | 'other';

export type ReportStatus = 'Submitted' | 'Under Review' | 'Dispatched' | 'In Progress' | 'Resolved';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ServiceReport {
  id: string;
  title: string;
  category: CategoryType;
  chiefdom: string;
  wardNumber: string;
  locationDetails: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  status: ReportStatus;
  priority: PriorityLevel;
  submittedAt: string;
  updatedAt: string;
  officialNote?: string;
}

export interface Citizen {
  id: string;
  nin: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  chiefdom: string;
  community: string;
  gender: string;
  dob: string;
  idType: string;
  registeredAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  payerName: string;
  payerPhone: string;
  service: string;
  revenueType: string;
  ward: string;
  chiefdom: string;
  amountNLe: number;
  paymentMethod: string;
  date: string;
  collector: string;
  status: 'Verified' | 'Pending Audit' | 'Voided';
  description: string;
  securityHash: string;
}

export interface BusinessLicence {
  id: string;
  licenceNo: string;
  businessName: string;
  ownerName: string;
  businessType: string;
  location: string;
  chiefdom: string;
  ward: string;
  issueDate: string;
  expiryDate: string;
  amountPaidNLe: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface BuildingPermit {
  id: string;
  permitNo: string;
  applicantName: string;
  propertyLocation: string;
  chiefdom: string;
  ward: string;
  projectType: string;
  estimatedValueNLe: number;
  feePaidNLe: number;
  approvalStatus: 'Approved' | 'Pending Inspection' | 'Under Review' | 'Rejected';
  appliedDate: string;
  approvedDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  target: string;
}

export interface ChiefdomInfo {
  id: string;
  name: string;
  capital: string;
  paramountChief: string;
  councillor: string;
  wards: string[];
  populationEst: string;
  activeProjectsCount: number;
  healthCentersCount: number;
  schoolsCount: number;
  primaryEconomicActivity: string;
  councilOfficeLocation: string;
  description: string;
}

export type SectorType = 'Infrastructure' | 'Water & Sanitation' | 'Health' | 'Education' | 'Agriculture' | 'Energy';

export interface DevelopmentProject {
  id: string;
  title: string;
  sector: SectorType;
  chiefdom: string;
  budgetNLe: number;
  fundingSource: string;
  progress: number;
  status: 'Planning' | 'In Progress' | 'Near Completion' | 'Completed';
  startDate: string;
  targetCompletion: string;
  contractor: string;
  impactSummary: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'Public Notice' | 'Meeting' | 'Tax Notice' | 'Health Alert' | 'Tender';
  date: string;
  summary: string;
  fullText: string;
  important: boolean;
}

export interface CouncilEvent {
  id: string;
  title: string;
  category: 'Council Meeting' | 'Town Hall' | 'Community Forum' | 'Public Hearing' | 'Cultural Event' | 'Health Drive';
  date: string;
  time: string;
  location: string;
  chiefdom: string;
  organizer: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type TabType = 
  | 'home' 
  | 'citizens'
  | 'revenue'
  | 'licences'
  | 'report' 
  | 'chiefdoms' 
  | 'tax' 
  | 'projects' 
  | 'notices' 
  | 'assistant' 
  | 'admin';

