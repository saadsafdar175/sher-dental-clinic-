import React from 'react';
import { X, ShieldCheck, CheckCircle2, BookOpen, Layers, Terminal, Database, HelpCircle } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sher Dental Clinic System — Setup & Operating Guide
              </h3>
              <p className="text-xs text-slate-500">
                Clinic Team Workflow, Role Responsibilities, and PKR Billing Procedures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Quick Start & Team Switcher */}
          <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Sher Dental Clinic Team & Role-Based Access
            </div>
            <p className="text-slate-600 leading-relaxed">
              Staff members can quickly switch their active logged-in profile using the <strong>Staff Switcher</strong> in the top header:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-teal-200 shadow-2xs">
                <span className="font-bold text-purple-900 block text-xs">Dr. Sher Muhammad</span>
                <span className="text-[10px] text-purple-700 font-mono font-semibold uppercase">Clinic Owner (Admin)</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Executive oversight, financial P&L reports (PKR), expense approvals, clinic profile, team administration, and system audit trail.
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-teal-200 shadow-2xs">
                <span className="font-bold text-teal-900 block text-xs">Dr. Zeeshan & Dr. Rahmatullah</span>
                <span className="text-[10px] text-teal-700 font-mono font-semibold uppercase">BDS Dentists</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Patient dental examinations, charting, appointment scheduling, treatment plans, and itemized invoice creation for treated patients.
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-teal-200 shadow-2xs">
                <span className="font-bold text-amber-900 block text-xs">M. Zuhaib & Imdadullah</span>
                <span className="text-[10px] text-amber-700 font-mono font-semibold uppercase">Trainee Workers</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Patient registration, chairside assistance, check-in queue management, collecting PKR payments (cash/online), and logging inventory.
                </span>
              </div>
            </div>
          </div>

          {/* Core Feature Workflows */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              Core System Workflows
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">1. Patient Care & Medical History</strong>
                <p className="text-slate-600">
                  Search patients by name, phone, or ID. Click any patient to open their comprehensive clinical record:
                  view medical conditions, high-visibility allergy alerts, treatment notes, visit history, and financial billing ledger.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">2. Appointment Scheduling & Check-in Pipeline</strong>
                <p className="text-slate-600">
                  Toggle between the interactive <strong>Monthly Calendar View</strong> and the <strong>Daily Schedule List</strong>.
                  Manage real-time status transitions: <em>Scheduled → Checked In → Completed → Cancelled</em>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">3. Itemized Billing & Installment Plans</strong>
                <p className="text-slate-600">
                  Create visit invoices with multi-line treatments, tooth numbers (e.g. #14), procedure fees, and discounts.
                  Toggle <strong>Installment Plan</strong> to automatically calculate monthly schedules. Record partial down-payments or full settlements.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">4. Financial Reports & 1-Click CSV Export</strong>
                <p className="text-slate-600">
                  Admin-accessible executive reporting provides Income, Expenses, and Net Profit calculations across daily, monthly, and yearly intervals.
                  View breakdowns by treatment category, revenue by dentist, and overdue patient balance aging with instant CSV download.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">5. Dental Supplies & Low-Stock Alerts</strong>
                <p className="text-slate-600">
                  Monitor dental inventory (anesthetics, composite resins, PPE, burs) with automated low-stock warnings.
                  When restocking, the system can automatically log the purchase cost into the clinic operating expenses ledger.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">6. Financial Audit Trail</strong>
                <p className="text-slate-600">
                  Every bill creation, payment receipt, status modification, and expense is recorded in an immutable audit log
                  with timestamps, user identity, and change details.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Architecture & Running */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-700" />
              Technical Specifications & How to Run
            </h4>
            <div className="font-mono text-[11px] bg-slate-900 text-slate-200 p-3 rounded-lg space-y-1">
              <p># 1. Install dependencies</p>
              <p className="text-emerald-400">npm install</p>
              <p className="mt-2"># 2. Start the development server</p>
              <p className="text-emerald-400">npm run dev</p>
              <p className="mt-2"># 3. Production build & validation</p>
              <p className="text-emerald-400">npm run build</p>
            </div>
            <p className="text-slate-600 text-[11px]">
              <strong>Data Persistence & Currency:</strong> All clinic records are stored locally with structured consistency using Pakistani Rupees (PKR).
              The system starts completely clean (0 records) ready for actual patient intake.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sher Dental Clinic Management System · Pakistan (PKR)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
