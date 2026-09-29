import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { PatientsView } from './components/views/PatientsView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { BillingView } from './components/views/BillingView';
import { ReportsView } from './components/views/ReportsView';
import { ExpensesView } from './components/views/ExpensesView';
import { InventoryView } from './components/views/InventoryView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';

import { PatientModal } from './components/modals/PatientModal';
import { PatientDrawer } from './components/modals/PatientDrawer';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { ViewInvoiceModal } from './components/modals/ViewInvoiceModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { RestockModal } from './components/modals/RestockModal';
import { NewInventoryItemModal } from './components/modals/NewInventoryItemModal';
import { SetupGuideModal } from './components/modals/SetupGuideModal';

import { Patient, Appointment, InventoryItem } from './types';

const MainApp: React.FC = () => {
  const { patients, currentUser } = useClinic();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isPatientDrawerOpen, setIsPatientDrawerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [preselectedPatientForApt, setPreselectedPatientForApt] = useState<Patient | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [preselectedPatientForInvoice, setPreselectedPatientForInvoice] = useState<Patient | null>(null);
  const [preselectedAppointmentForInvoice, setPreselectedAppointmentForInvoice] = useState<Appointment | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);

  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);

  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Handlers
  const handleSelectPatient = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    if (p) {
      setSelectedPatient(p);
      setIsPatientDrawerOpen(true);
    }
  };

  const handleEditPatient = (p: Patient) => {
    setPatientToEdit(p);
    setIsPatientModalOpen(true);
  };

  const handleBookAppointmentForPatient = (p: Patient) => {
    setAppointmentToEdit(null);
    setPreselectedPatientForApt(p);
    setIsAppointmentModalOpen(true);
  };

  const handleCreateInvoiceForPatient = (p: Patient) => {
    setPreselectedPatientForInvoice(p);
    setPreselectedAppointmentForInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleCreateInvoiceForAppointment = (apt: Appointment) => {
    const p = patients.find((pat) => pat.id === apt.patientId);
    setPreselectedPatientForInvoice(p || null);
    setPreselectedAppointmentForInvoice(apt);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenPayment = (invoiceId: string) => {
    setPaymentInvoiceId(invoiceId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenViewInvoice = (invoiceId: string) => {
    setViewInvoiceId(invoiceId);
    setIsViewInvoiceModalOpen(true);
  };

  const handleOpenRestock = (item: InventoryItem) => {
    setRestockItem(item);
    setIsRestockModalOpen(true);
  };

  // Guard against restricted tabs when switching role
  const isTabAllowedForRole = (tab: NavTab) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'dentist') {
      return ['dashboard', 'patients', 'appointments', 'billing', 'inventory'].includes(tab);
    }
    if (currentUser.role === 'trainee' || currentUser.role === 'receptionist') {
      return ['dashboard', 'patients', 'appointments', 'billing', 'expenses', 'inventory'].includes(tab);
    }
    return false;
  };

  const currentTab = isTabAllowedForRole(activeTab) ? activeTab : 'dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={currentTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onOpenNewAppointment={() => {
            setAppointmentToEdit(null);
            setPreselectedPatientForApt(null);
            setIsAppointmentModalOpen(true);
          }}
          onOpenNewPatient={() => {
            setPatientToEdit(null);
            setIsPatientModalOpen(true);
          }}
          onOpenNewInvoice={() => {
            setPreselectedPatientForInvoice(null);
            setPreselectedAppointmentForInvoice(null);
            setIsInvoiceModalOpen(true);
          }}
          onOpenNewExpense={() => setIsExpenseModalOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenNewAppointment={() => {
                setAppointmentToEdit(null);
                setPreselectedPatientForApt(null);
                setIsAppointmentModalOpen(true);
              }}
              onOpenNewPatient={() => {
                setPatientToEdit(null);
                setIsPatientModalOpen(true);
              }}
              onOpenNewInvoice={() => {
                setPreselectedPatientForInvoice(null);
                setPreselectedAppointmentForInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onOpenNewExpense={() => setIsExpenseModalOpen(true)}
              onSelectPatient={handleSelectPatient}
              onViewInvoice={handleOpenViewInvoice}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsView
              onOpenNewPatient={() => {
                setPatientToEdit(null);
                setIsPatientModalOpen(true);
              }}
              onSelectPatient={handleSelectPatient}
              onEditPatient={handleEditPatient}
              onBookAppointmentForPatient={handleBookAppointmentForPatient}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              onOpenNewAppointment={() => {
                setAppointmentToEdit(null);
                setPreselectedPatientForApt(null);
                setIsAppointmentModalOpen(true);
              }}
              onEditAppointment={(apt) => {
                setAppointmentToEdit(apt);
                setIsAppointmentModalOpen(true);
              }}
              onSelectPatient={handleSelectPatient}
              onCreateInvoiceForAppointment={handleCreateInvoiceForAppointment}
            />
          )}

          {currentTab === 'billing' && (
            <BillingView
              onOpenNewInvoice={() => {
                setPreselectedPatientForInvoice(null);
                setPreselectedAppointmentForInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onRecordPayment={handleOpenPayment}
              onViewInvoice={handleOpenViewInvoice}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              onRecordPayment={handleOpenPayment}
              onViewInvoice={handleOpenViewInvoice}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView onOpenNewExpense={() => setIsExpenseModalOpen(true)} />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              onOpenRestockModal={handleOpenRestock}
              onOpenNewItemModal={() => setIsNewItemModalOpen(true)}
            />
          )}

          {currentTab === 'audit' && <AuditLogsView />}

          {currentTab === 'profile' && <ProfileSettingsView />}
        </main>
      </div>

      {/* MODALS & DRAWERS */}
      {/* Patient Register / Edit Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setPatientToEdit(null);
        }}
        patientToEdit={patientToEdit}
        onSaved={(saved) => {
          if (selectedPatient && selectedPatient.id === saved.id) {
            setSelectedPatient(saved);
          }
        }}
      />

      {/* Patient Profile Drawer */}
      <PatientDrawer
        patient={selectedPatient}
        isOpen={isPatientDrawerOpen}
        onClose={() => {
          setIsPatientDrawerOpen(false);
          setSelectedPatient(null);
        }}
        onEditPatient={(p) => {
          setPatientToEdit(p);
          setIsPatientModalOpen(true);
        }}
        onBookAppointment={handleBookAppointmentForPatient}
        onCreateInvoice={handleCreateInvoiceForPatient}
        onRecordPayment={handleOpenPayment}
        onViewInvoice={handleOpenViewInvoice}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setAppointmentToEdit(null);
          setPreselectedPatientForApt(null);
        }}
        appointmentToEdit={appointmentToEdit}
        preselectedPatient={preselectedPatientForApt}
      />

      {/* Itemized Invoice Generator Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setPreselectedPatientForInvoice(null);
          setPreselectedAppointmentForInvoice(null);
        }}
        preselectedPatient={preselectedPatientForInvoice}
        preselectedAppointment={preselectedAppointmentForInvoice}
        onInvoiceCreated={(invId) => {
          handleOpenViewInvoice(invId);
        }}
      />

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentInvoiceId(null);
        }}
        invoiceId={paymentInvoiceId}
      />

      {/* View / Print Itemized Invoice Modal */}
      <ViewInvoiceModal
        isOpen={isViewInvoiceModalOpen}
        onClose={() => {
          setIsViewInvoiceModalOpen(false);
          setViewInvoiceId(null);
        }}
        invoiceId={viewInvoiceId}
        onRecordPayment={(id) => {
          setIsViewInvoiceModalOpen(false);
          handleOpenPayment(id);
        }}
      />

      {/* Operating Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* Restock Inventory Item Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockItem(null);
        }}
        item={restockItem}
      />

      {/* Add New Inventory SKU Modal */}
      <NewInventoryItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
      />

      {/* System Guide & Operating Instructions Modal */}
      <SetupGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainApp />
    </ClinicProvider>
  );
}
