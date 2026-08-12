import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

// Users table with roles & chiefdom association
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default('District Citizen'),
  role: text('role').notNull().default('citizen'), // 'citizen' | 'officer' | 'admin'
  chiefdom: text('chiefdom').notNull().default('Kakua'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Civic service reports submitted by citizens
export const serviceReports = pgTable('service_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default('Service Request'),
  category: text('category').notNull(),
  chiefdom: text('chiefdom').notNull(),
  wardNumber: text('ward_number').notNull().default('Ward 280'),
  locationDetails: text('location_details').notNull().default(''),
  description: text('description').notNull(),
  reporterName: text('reporter_name').notNull().default('Resident'),
  reporterPhone: text('reporter_phone').notNull().default('+232 76 000 000'),
  status: text('status').notNull().default('Submitted'),
  priority: text('priority').notNull().default('Medium'),
  submittedAt: text('submitted_at').notNull().default('2026-08-12 10:00'),
  updatedAt: text('updated_at').notNull().default('2026-08-12 10:00'),
  officialNote: text('official_note').default(''),
  userUid: text('user_uid')
});

// Development Projects tracked across the district
export const developmentProjects = pgTable('development_projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  sector: text('sector').notNull().default('Infrastructure'),
  chiefdom: text('chiefdom').notNull(),
  budgetNLe: integer('budget_nle').notNull().default(500000),
  fundingSource: text('funding_source').notNull().default('District Revenue'),
  progress: integer('progress').notNull().default(0),
  status: text('status').notNull().default('In Progress'),
  startDate: text('start_date').notNull(),
  targetCompletion: text('target_completion').notNull(),
  contractor: text('contractor').notNull(),
  impactSummary: text('impact_summary').notNull().default('')
});

// Official Council Announcements
export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  summary: text('summary').notNull(),
  fullText: text('full_text').notNull(),
  important: boolean('important').notNull().default(false)
});

// Bo District Council Events & Meetings
export const councilEvents = pgTable('council_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  chiefdom: text('chiefdom').notNull(),
  organizer: text('organizer').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Upcoming')
});

// Citizen Registry Table
export const citizens = pgTable('citizens', {
  id: text('id').primaryKey(),
  nin: text('nin').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull().default(''),
  ward: text('ward').notNull().default('Ward 280'),
  chiefdom: text('chiefdom').notNull().default('Kakua'),
  community: text('community').notNull().default(''),
  gender: text('gender').notNull().default('Male'),
  dob: text('dob').notNull().default('1990-01-01'),
  idType: text('id_type').notNull().default('National ID Card'),
  registeredAt: text('registered_at').notNull().default('2026-08-12')
});

// Tax & Dues Payment Receipts
export const paymentReceipts = pgTable('payment_receipts', {
  id: text('id').primaryKey(),
  receiptNo: text('receipt_no').notNull(),
  payerName: text('payer_name').notNull(),
  payerPhone: text('payer_phone').notNull().default('+232 76 000 000'),
  service: text('service').notNull().default('Property Rate'),
  revenueType: text('revenue_type').notNull().default('Property Rates'),
  ward: text('ward').notNull().default('Ward 280'),
  chiefdom: text('chiefdom').notNull(),
  amountNLe: integer('amount_nle').notNull().default(1000),
  paymentMethod: text('payment_method').notNull().default('Mobile Money'),
  date: text('date').notNull(),
  collector: text('collector').notNull().default('Treasury Officer'),
  status: text('status').notNull().default('Verified'),
  description: text('description').notNull().default(''),
  securityHash: text('security_hash').notNull().default('BDC-SEC-HASH')
});

// Business Operations Licences
export const businessLicences = pgTable('business_licences', {
  id: text('id').primaryKey(),
  licenceNo: text('licence_no').notNull(),
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  businessType: text('business_type').notNull().default('General Trading'),
  location: text('location').notNull().default('Central Market'),
  chiefdom: text('chiefdom').notNull(),
  ward: text('ward').notNull().default('Ward 280'),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  amountPaidNLe: integer('amount_paid_nle').notNull().default(1000),
  status: text('status').notNull().default('Active')
});

// Building & Construction Permits
export const buildingPermits = pgTable('building_permits', {
  id: text('id').primaryKey(),
  permitNo: text('permit_no').notNull(),
  applicantName: text('applicant_name').notNull(),
  propertyLocation: text('property_location').notNull(),
  chiefdom: text('chiefdom').notNull(),
  ward: text('ward').notNull().default('Ward 280'),
  projectType: text('project_type').notNull().default('Commercial'),
  estimatedValueNLe: integer('estimated_value_nle').notNull().default(100000),
  feePaidNLe: integer('fee_paid_nle').notNull().default(2500),
  approvalStatus: text('approval_status').notNull().default('Approved'),
  appliedDate: text('applied_date').notNull(),
  approvedDate: text('approved_date').notNull()
});

// Chiefdoms & Council Wards Directory Table
export const chiefdoms = pgTable('chiefdoms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capital: text('capital').notNull(),
  paramountChief: text('paramount_chief').notNull(),
  councillor: text('councillor').notNull(),
  wards: text('wards').notNull().default('[]'),
  populationEst: text('population_est').notNull().default('50,000'),
  activeProjectsCount: integer('active_projects_count').notNull().default(0),
  healthCentersCount: integer('health_centers_count').notNull().default(0),
  schoolsCount: integer('schools_count').notNull().default(0),
  primaryEconomicActivity: text('primary_economic_activity').notNull().default(''),
  councilOfficeLocation: text('council_office_location').notNull().default(''),
  description: text('description').notNull().default('')
});

// Immutable Governance Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  user: text('user').notNull(),
  role: text('role').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull()
});
