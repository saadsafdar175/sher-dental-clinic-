export type UserRole = 'admin' | 'dentist' | 'trainee' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string; // e.g. "Clinic Owner", "BDS Dentist", "Trainee Worker"
  phone?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. "SDC-2026-001"
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob?: string;
  age?: number | string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  allergies: string[];
  medicalConditions: string[];
  dentalNotes?: string;
  createdAt: string;
}

export type AppointmentStatus = 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string; // Responsible Dentist or Trainee Worker
  dentistName: string;
  traineeId?: string; // Optional assisting trainee worker
  traineeName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  type: string;
  operatory: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface TreatmentCatalogItem {
  id: string;
  code?: string;
  name: string;
  category: 'Diagnostic' | 'Preventive' | 'Restorative' | 'Endodontics' | 'Oral Surgery' | 'Orthodontics' | 'Cosmetic' | 'Periodontics' | 'General';
  defaultFee: number; // in PKR
  estimatedMinutes?: number;
}

export interface InvoiceItem {
  id: string;
  treatmentCatalogId?: string;
  treatmentName: string;
  toothNumber?: string;
  quantity: number;
  unitPrice: number; // in PKR
  discount: number; // in PKR
  total: number; // in PKR
}

export interface Installment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number; // in PKR
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  paymentMethod?: string;
  reference?: string;
}

export type InvoiceStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "SDC-INV-001"
  patientId: string;
  patientName: string;
  appointmentId?: string;
  dentistId: string; // Responsible Doctor / Trainee
  dentistName: string;
  traineeId?: string;
  traineeName?: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number; // in PKR
  discountTotal: number; // in PKR
  tax: number; // in PKR
  grandTotal: number; // in PKR
  amountPaid: number; // in PKR
  remainingBalance: number; // in PKR
  status: InvoiceStatus;
  isInstallmentPlan: boolean;
  installments?: Installment[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'JazzCash'
  | 'EasyPaisa'
  | 'Credit / Debit Card'
  | 'Cheque';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number; // in PKR
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  receivedBy: string; // e.g., Staff name
  createdAt: string;
}

export type ExpenseCategory =
  | 'Rent & Premises'
  | 'Staff Salaries & Stipends'
  | 'Dental Supplies & Consumables'
  | 'Dental Lab Charges'
  | 'Electricity & Utilities'
  | 'Equipment Maintenance & Sterilization'
  | 'Office, Tea & Sundries'
  | 'Marketing & Signage';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number; // in PKR
  description: string;
  vendor: string;
  paymentMethod: string;
  recordedBy: string; // Staff member
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'PPE & Sanitation' | 'Restorative & Composite' | 'Endodontic' | 'Anesthetics & Pharma' | 'Surgical & Burs' | 'Impression & Lab' | 'General';
  quantity: number;
  unit: string; // packets, boxes, tubes, vials, units
  minStockLevel: number;
  unitCost: number; // in PKR
  supplier: string;
  lastRestocked?: string;
}

export interface StockPurchase {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantityAdded: number;
  unitCost: number; // in PKR
  totalCost: number; // in PKR
  date: string;
  supplier: string;
  recordedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'Invoice' | 'Payment' | 'Appointment' | 'Patient' | 'Expense' | 'Inventory' | 'System';
  entityId: string;
  details: string;
}

export interface ClinicProfile {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  taxNumber?: string;
  currencySymbol: string; // "PKR"
}
