import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Appointment,
  AppointmentStatus,
  AuditLog,
  ClinicProfile,
  Expense,
  InventoryItem,
  Invoice,
  Patient,
  Payment,
  StockPurchase,
  TreatmentCatalogItem,
  User,
  UserRole,
} from '../types';
import {
  initialAppointments,
  initialAuditLogs,
  initialClinicProfile,
  initialExpenses,
  initialInventory,
  initialInvoices,
  initialPatients,
  initialPayments,
  initialStockPurchases,
  initialUsers,
  treatmentCatalog as defaultCatalog,
} from '../data/seedData';

interface ClinicContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  clinicProfile: ClinicProfile;
  updateClinicProfile: (profile: ClinicProfile) => void;
  formatPKR: (amount: number | string | undefined | null) => string;

  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'patientId' | 'createdAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;

  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  cancelAppointment: (id: string, reason?: string) => void;

  // Invoices & Billing
  invoices: Invoice[];
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status' | 'amountPaid' | 'remainingBalance'> & { initialPaymentAmount?: number; paymentMethod?: Payment['paymentMethod'] }) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Payments
  payments: Payment[];
  recordPayment: (paymentData: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    reference?: string;
    notes?: string;
    receivedBy?: string;
  }) => Payment;

  // Treatments catalog
  treatments: TreatmentCatalogItem[];

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }) => Expense;
  deleteExpense: (id: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  restockItem: (itemId: string, quantityToAdd: number, unitCost: number, supplier: string, recordAsExpense?: boolean) => void;
  stockPurchases: StockPurchase[];

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => void;

  // Utilities
  clearAllRecords: () => void;
  exportCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

// Sher Dental Clinic storage keys (version 2 ensures old fake apex data is evicted)
const STORAGE_KEYS = {
  USER: 'sher_dental_current_user_v2',
  PROFILE: 'sher_dental_clinic_profile_v2',
  PATIENTS: 'sher_dental_patients_v2',
  APPOINTMENTS: 'sher_dental_appointments_v2',
  INVOICES: 'sher_dental_invoices_v2',
  PAYMENTS: 'sher_dental_payments_v2',
  EXPENSES: 'sher_dental_expenses_v2',
  INVENTORY: 'sher_dental_inventory_v2',
  PURCHASES: 'sher_dental_purchases_v2',
  AUDIT: 'sher_dental_audit_v2',
  CATALOG: 'sher_dental_catalog_v2',
};

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

function getStoredOrDefault<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Helper to format currency consistently as PKR
export const formatPKR = (amount: number | string | undefined | null): string => {
  const num = Number(amount) || 0;
  return `PKR ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any stale apex_dental cache on startup
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('apex_dental_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() =>
    getStoredOrDefault<User>(STORAGE_KEYS.USER, initialUsers[0]) // Dr. Sher Muhammad
  );
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(() =>
    getStoredOrDefault<ClinicProfile>(STORAGE_KEYS.PROFILE, initialClinicProfile)
  );
  const [patients, setPatients] = useState<Patient[]>(() =>
    getStoredOrDefault<Patient[]>(STORAGE_KEYS.PATIENTS, initialPatients)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    getStoredOrDefault<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    getStoredOrDefault<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices)
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    getStoredOrDefault<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    getStoredOrDefault<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses)
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    getStoredOrDefault<InventoryItem[]>(STORAGE_KEYS.INVENTORY, initialInventory)
  );
  const [stockPurchases, setStockPurchases] = useState<StockPurchase[]>(() =>
    getStoredOrDefault<StockPurchase[]>(STORAGE_KEYS.PURCHASES, initialStockPurchases)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    getStoredOrDefault<AuditLog[]>(STORAGE_KEYS.AUDIT, initialAuditLogs)
  );
  const [treatments] = useState<TreatmentCatalogItem[]>(() =>
    getStoredOrDefault<TreatmentCatalogItem[]>(STORAGE_KEYS.CATALOG, defaultCatalog)
  );

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(clinicProfile));
  }, [clinicProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(stockPurchases));
  }, [stockPurchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Log audit helper
  const logAction = (
    action: string,
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      logAction(
        'STAFF_SWITCHED',
        'System',
        target.id,
        `Active user switched to ${target.name} (${target.title}).`
      );
    }
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role) || users[0];
    setCurrentUser(targetUser);
  };

  const updateClinicProfile = (profile: ClinicProfile) => {
    setClinicProfile(profile);
    logAction('CLINIC_PROFILE_UPDATED', 'System', 'profile', 'Updated Sher Dental Clinic profile information.');
  };

  // Patients
  const addPatient = (patientData: Omit<Patient, 'id' | 'patientId' | 'createdAt'>): Patient => {
    const newNum = patients.length + 1;
    const formattedId = `SDC-${String(newNum).padStart(4, '0')}`;
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      patientId: formattedId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPatient, ...prev]);
    logAction('PATIENT_CREATED', 'Patient', newPatient.id, `Registered patient: ${newPatient.name} (${newPatient.patientId}).`);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          logAction('PATIENT_UPDATED', 'Patient', id, `Updated patient record for ${updated.name}.`);
          return updated;
        }
        return p;
      })
    );
  };

  const deletePatient = (id: string) => {
    const p = patients.find((pat) => pat.id === id);
    setPatients((prev) => prev.filter((pat) => pat.id !== id));
    if (p) {
      logAction('PATIENT_DELETED', 'Patient', id, `Removed patient record: ${p.name}.`);
    }
  };

  const getPatientById = (id: string) => patients.find((p) => p.id === id);

  // Appointments
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    logAction(
      'APPOINTMENT_SCHEDULED',
      'Appointment',
      newApt.id,
      `Scheduled ${newApt.type} for ${newApt.patientName} with ${newApt.dentistName}${newApt.traineeName ? ` (Assisted by: ${newApt.traineeName})` : ''} on ${newApt.date} at ${newApt.time}.`
    );
    return newApt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          logAction(
            'APPOINTMENT_UPDATED',
            'Appointment',
            id,
            `Modified appointment for ${updated.patientName} on ${updated.date}.`
          );
          return updated;
        }
        return a;
      })
    );
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          logAction(
            'APPOINTMENT_STATUS_CHANGE',
            'Appointment',
            id,
            `Changed status to "${status}" for appointment of ${a.patientName} (${a.date} ${a.time}).`
          );
          return { ...a, status };
        }
        return a;
      })
    );
  };

  const cancelAppointment = (id: string, reason?: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const detail = reason ? ` (${reason})` : '';
          logAction(
            'APPOINTMENT_CANCELLED',
            'Appointment',
            id,
            `Cancelled appointment for ${a.patientName} on ${a.date}${detail}.`
          );
          return {
            ...a,
            status: 'Cancelled',
            notes: a.notes ? `${a.notes} [Cancelled: ${reason || 'N/A'}]` : `Cancelled: ${reason || 'N/A'}`,
          };
        }
        return a;
      })
    );
  };

  // Invoices & Billing
  const createInvoice = (
    invoiceData: Omit<
      Invoice,
      'id' | 'invoiceNumber' | 'createdAt' | 'status' | 'amountPaid' | 'remainingBalance'
    > & { initialPaymentAmount?: number; paymentMethod?: Payment['paymentMethod'] }
  ): Invoice => {
    const nextInvNum = `SDC-INV-${String(invoices.length + 1).padStart(4, '0')}`;
    const initialPay = Number(invoiceData.initialPaymentAmount || 0);
    const grandTotal = Number(invoiceData.grandTotal);
    const remaining = Math.max(0, grandTotal - initialPay);

    let calculatedStatus: Invoice['status'] = 'Unpaid';
    if (initialPay >= grandTotal && grandTotal > 0) {
      calculatedStatus = 'Paid';
    } else if (initialPay > 0) {
      calculatedStatus = 'Partial';
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextInvNum,
      patientId: invoiceData.patientId,
      patientName: invoiceData.patientName,
      appointmentId: invoiceData.appointmentId,
      dentistId: invoiceData.dentistId,
      dentistName: invoiceData.dentistName,
      traineeId: invoiceData.traineeId,
      traineeName: invoiceData.traineeName,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      items: invoiceData.items,
      subtotal: invoiceData.subtotal,
      discountTotal: invoiceData.discountTotal,
      tax: invoiceData.tax,
      grandTotal: grandTotal,
      amountPaid: initialPay,
      remainingBalance: remaining,
      status: calculatedStatus,
      isInstallmentPlan: !!invoiceData.isInstallmentPlan,
      installments: invoiceData.installments,
      notes: invoiceData.notes,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    logAction(
      'INVOICE_CREATED',
      'Invoice',
      newInvoice.id,
      `Generated invoice ${newInvoice.invoiceNumber} for ${newInvoice.patientName}. Total: ${formatPKR(grandTotal)}${
        newInvoice.isInstallmentPlan ? ' (Installments enabled)' : ''
      }. Attending: ${newInvoice.dentistName}${newInvoice.traineeName ? `, Assistant: ${newInvoice.traineeName}` : ''}.`
    );

    // If initial payment received, record it
    if (initialPay > 0 && invoiceData.paymentMethod) {
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        patientId: newInvoice.patientId,
        patientName: newInvoice.patientName,
        date: newInvoice.date,
        amount: initialPay,
        paymentMethod: invoiceData.paymentMethod,
        reference: `INIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        notes: 'Initial payment at invoice generation',
        receivedBy: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [payment, ...prev]);
      logAction(
        'PAYMENT_RECORDED',
        'Payment',
        payment.id,
        `Recorded initial payment of ${formatPKR(initialPay)} on ${newInvoice.invoiceNumber} via ${payment.paymentMethod}.`
      );
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
          logAction(
            'INVOICE_UPDATED',
            'Invoice',
            id,
            `Updated invoice details for ${inv.invoiceNumber} (${inv.patientName}).`
          );
          return updated;
        }
        return inv;
      })
    );
  };

  const deleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (inv) {
      logAction(
        'INVOICE_VOIDED',
        'Invoice',
        id,
        `Voided invoice ${inv.invoiceNumber} for ${inv.patientName} (Balance: ${formatPKR(inv.remainingBalance)}).`
      );
    }
  };

  // Payments
  const recordPayment = ({
    invoiceId,
    amount,
    paymentMethod,
    reference,
    notes,
    receivedBy,
  }: {
    invoiceId: string;
    amount: number;
    paymentMethod: Payment['paymentMethod'];
    reference?: string;
    notes?: string;
    receivedBy?: string;
  }): Payment => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const paymentAmount = Number(amount);
    const newAmountPaid = invoice.amountPaid + paymentAmount;
    const newRemainingBalance = Math.max(0, invoice.grandTotal - newAmountPaid);
    const newStatus: Invoice['status'] = newRemainingBalance <= 0 ? 'Paid' : 'Partial';

    let updatedInstallments = invoice.installments;
    if (invoice.isInstallmentPlan && invoice.installments && invoice.installments.length > 0) {
      let remainingCredit = paymentAmount;
      updatedInstallments = invoice.installments.map((inst) => {
        if (inst.status !== 'Paid' && remainingCredit > 0) {
          if (remainingCredit >= inst.amount) {
            remainingCredit -= inst.amount;
            return {
              ...inst,
              status: 'Paid' as const,
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod,
              reference: reference || 'RCP',
            };
          }
        }
        return inst;
      });
    }

    const staffInCharge = receivedBy || currentUser.name;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      date: new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      paymentMethod,
      reference: reference || `RCP-${Date.now().toString().slice(-6)}`,
      notes,
      receivedBy: staffInCharge,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            amountPaid: newAmountPaid,
            remainingBalance: newRemainingBalance,
            status: newStatus,
            installments: updatedInstallments,
            updatedAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );

    logAction(
      'PAYMENT_RECORDED',
      'Payment',
      newPayment.id,
      `Received payment of ${formatPKR(paymentAmount)} on ${invoice.invoiceNumber} for ${
        invoice.patientName
      } via ${paymentMethod} by ${staffInCharge}. Remaining balance: ${formatPKR(newRemainingBalance)}.`
    );

    return newPayment;
  };

  // Expenses
  const addExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }
  ): Expense => {
    const staffInCharge = expenseData.recordedBy || currentUser.name;
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      recordedBy: staffInCharge,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    logAction(
      'EXPENSE_RECORDED',
      'Expense',
      newExpense.id,
      `Recorded expense: ${formatPKR(newExpense.amount)} for ${newExpense.category} (${newExpense.description}) by ${staffInCharge}.`
    );
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (exp) {
      logAction(
        'EXPENSE_DELETED',
        'Expense',
        id,
        `Removed expense entry ${formatPKR(exp.amount)} (${exp.description}).`
      );
    }
  };

  // Inventory
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestocked'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-item-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
    logAction(
      'INVENTORY_ADDED',
      'Inventory',
      newItem.id,
      `Added new inventory item: ${newItem.name} (${newItem.sku}) - Qty: ${newItem.quantity} ${newItem.unit} @ ${formatPKR(newItem.unitCost)}.`
    );
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          logAction(
            'INVENTORY_UPDATED',
            'Inventory',
            id,
            `Updated stock for ${updated.name} (Qty: ${updated.quantity} ${updated.unit}).`
          );
          return updated;
        }
        return item;
      })
    );
  };

  const restockItem = (
    itemId: string,
    quantityToAdd: number,
    unitCost: number,
    supplier: string,
    recordAsExpense: boolean = true
  ) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const totalCost = quantityToAdd * unitCost;
    const nowStr = new Date().toISOString().split('T')[0];

    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            quantity: i.quantity + quantityToAdd,
            unitCost: unitCost || i.unitCost,
            supplier: supplier || i.supplier,
            lastRestocked: nowStr,
          };
        }
        return i;
      })
    );

    const purchase: StockPurchase = {
      id: `sp-${Date.now()}`,
      inventoryItemId: item.id,
      itemName: item.name,
      quantityAdded: quantityToAdd,
      unitCost,
      totalCost,
      date: nowStr,
      supplier,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setStockPurchases((prev) => [purchase, ...prev]);

    if (recordAsExpense) {
      const exp: Expense = {
        id: `exp-${Date.now()}`,
        date: nowStr,
        category: 'Dental Supplies & Consumables',
        amount: totalCost,
        description: `Restock: ${quantityToAdd} ${item.unit} of ${item.name}`,
        vendor: supplier,
        paymentMethod: 'Cash / Supplier Credit',
        recordedBy: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [exp, ...prev]);
    }

    logAction(
      'INVENTORY_RESTOCKED',
      'Inventory',
      item.id,
      `Restocked ${quantityToAdd} ${item.unit} of ${item.name} (${formatPKR(totalCost)}) from ${supplier}.`
    );
  };

  // Clear all data (starts clean with 0 fake records)
  const clearAllRecords = () => {
    setPatients([]);
    setAppointments([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    setInventory([]);
    setStockPurchases([]);
    setClinicProfile(initialClinicProfile);
    setCurrentUser(initialUsers[0]);

    const initLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: initialUsers[0].id,
      userName: initialUsers[0].name,
      userRole: initialUsers[0].role,
      action: 'SYSTEM_RESET',
      entityType: 'System',
      entityId: 'sher-dental-core',
      details: 'All clinic records cleared. Ready for fresh data entry by Sher Dental Clinic team.',
    };
    setAuditLogs([initLog]);

    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // CSV Export utility with PKR currency awareness
  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escapeCsvField = (field: string | number) => {
      const str = String(field ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escapeCsvField).join(',');
    const rowLines = rows.map((row) => row.map(escapeCsvField).join(','));
    const csvContent = [headerLine, ...rowLines].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        switchUser,
        switchRole,
        clinicProfile,
        updateClinicProfile,
        formatPKR,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        getPatientById,
        appointments,
        addAppointment,
        updateAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        invoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        payments,
        recordPayment,
        treatments,
        expenses,
        addExpense,
        deleteExpense,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        restockItem,
        stockPurchases,
        auditLogs,
        logAction,
        clearAllRecords,
        exportCsv,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
