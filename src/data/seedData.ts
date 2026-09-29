import {
  ClinicProfile,
  Expense,
  InventoryItem,
  Invoice,
  Patient,
  Payment,
  StockPurchase,
  TreatmentCatalogItem,
  User,
  Appointment,
  AuditLog,
} from '../types';

export const initialClinicProfile: ClinicProfile = {
  name: 'Sher Dental Clinic',
  tagline: 'Comprehensive Dental Care & Oral Health Excellence',
  phone: '+92 300 0000000',
  email: 'info@sherdentalclinic.com',
  address: 'Main Clinic Boulevard, Pakistan',
  website: 'www.sherdentalclinic.com',
  taxNumber: 'PK-NTN-DENT-01',
  currencySymbol: 'PKR',
};

// CLINIC TEAM:
// - Clinic owner: Dr. Sher Muhammad
// - BDS dentists: Dr. Zeeshan and Dr. Rahmatullah
// - Trainee workers: M. Zuhaib and Imdadullah
export const initialUsers: User[] = [
  {
    id: 'user-owner',
    name: 'Dr. Sher Muhammad',
    email: 'dr.sher@sherdentalclinic.com',
    role: 'admin',
    title: 'Clinic Owner & Senior Dental Surgeon',
    phone: '+92 300 1234567',
  },
  {
    id: 'user-dentist-zeeshan',
    name: 'Dr. Zeeshan',
    email: 'dr.zeeshan@sherdentalclinic.com',
    role: 'dentist',
    title: 'BDS Dentist',
    phone: '+92 301 2345678',
  },
  {
    id: 'user-dentist-rahmatullah',
    name: 'Dr. Rahmatullah',
    email: 'dr.rahmatullah@sherdentalclinic.com',
    role: 'dentist',
    title: 'BDS Dentist',
    phone: '+92 302 3456789',
  },
  {
    id: 'user-trainee-zuhaib',
    name: 'M. Zuhaib',
    email: 'zuhaib@sherdentalclinic.com',
    role: 'trainee',
    title: 'Trainee Worker & Clinical Assistant',
    phone: '+92 303 4567890',
  },
  {
    id: 'user-trainee-imdadullah',
    name: 'Imdadullah',
    email: 'imdadullah@sherdentalclinic.com',
    role: 'trainee',
    title: 'Trainee Worker & Clinical Assistant',
    phone: '+92 304 5678901',
  },
];

// Clean procedure catalog with PKR standard pricing for quick selection
export const treatmentCatalog: TreatmentCatalogItem[] = [
  {
    id: 'treat-consult',
    code: 'CON-01',
    name: 'Dental Consultation & Oral Examination',
    category: 'Diagnostic',
    defaultFee: 500, // PKR
    estimatedMinutes: 20,
  },
  {
    id: 'treat-xray',
    code: 'RAD-01',
    name: 'Dental X-Ray (Periapical / Bitewing)',
    category: 'Diagnostic',
    defaultFee: 500, // PKR
    estimatedMinutes: 15,
  },
  {
    id: 'treat-scaling',
    code: 'PRV-01',
    name: 'Scaling & Polishing (Full Mouth Clean)',
    category: 'Preventive',
    defaultFee: 2500, // PKR
    estimatedMinutes: 40,
  },
  {
    id: 'treat-composite-1',
    code: 'RES-01',
    name: 'Light-Cure Composite Filling (1 Surface)',
    category: 'Restorative',
    defaultFee: 2000, // PKR
    estimatedMinutes: 30,
  },
  {
    id: 'treat-composite-2',
    code: 'RES-02',
    name: 'Light-Cure Composite Filling (Multi-Surface)',
    category: 'Restorative',
    defaultFee: 3000, // PKR
    estimatedMinutes: 45,
  },
  {
    id: 'treat-gic',
    code: 'RES-03',
    name: 'GIC / Glass Ionomer Cement Filling',
    category: 'Restorative',
    defaultFee: 1500, // PKR
    estimatedMinutes: 30,
  },
  {
    id: 'treat-rct-ant',
    code: 'ENDO-01',
    name: 'Root Canal Treatment (Anterior Tooth)',
    category: 'Endodontics',
    defaultFee: 7000, // PKR
    estimatedMinutes: 60,
  },
  {
    id: 'treat-rct-post',
    code: 'ENDO-02',
    name: 'Root Canal Treatment (Molar / Premolar)',
    category: 'Endodontics',
    defaultFee: 10000, // PKR
    estimatedMinutes: 75,
  },
  {
    id: 'treat-ext-simple',
    code: 'SURG-01',
    name: 'Simple Tooth Extraction',
    category: 'Oral Surgery',
    defaultFee: 1500, // PKR
    estimatedMinutes: 30,
  },
  {
    id: 'treat-ext-surg',
    code: 'SURG-02',
    name: 'Surgical Extraction / Impacted Wisdom Tooth',
    category: 'Oral Surgery',
    defaultFee: 6000, // PKR
    estimatedMinutes: 60,
  },
  {
    id: 'treat-crown-porc',
    code: 'PROS-01',
    name: 'Porcelain Fused to Metal (PFM) Crown',
    category: 'Restorative',
    defaultFee: 6500, // PKR
    estimatedMinutes: 45,
  },
  {
    id: 'treat-crown-zirc',
    code: 'PROS-02',
    name: 'Zirconia / All-Ceramic Crown',
    category: 'Restorative',
    defaultFee: 14000, // PKR
    estimatedMinutes: 45,
  },
  {
    id: 'treat-whitening',
    code: 'COSM-01',
    name: 'Teeth Whitening / Bleaching',
    category: 'Cosmetic',
    defaultFee: 12000, // PKR
    estimatedMinutes: 60,
  },
];

// DATA CLEANUP:
// All fake, sample, placeholder, and irrelevant records removed.
// The system starts pristine for real data entry.
export const initialPatients: Patient[] = [];
export const initialAppointments: Appointment[] = [];
export const initialInvoices: Invoice[] = [];
export const initialPayments: Payment[] = [];
export const initialExpenses: Expense[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialStockPurchases: StockPurchase[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-init-1',
    timestamp: new Date().toISOString(),
    userId: 'user-owner',
    userName: 'Dr. Sher Muhammad',
    userRole: 'admin',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'System',
    entityId: 'sher-dental-core',
    details: 'Sher Dental Clinic Management System initialized for Dr. Sher Muhammad, Dr. Zeeshan, Dr. Rahmatullah, M. Zuhaib, and Imdadullah with PKR currency.',
  },
];
