import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { 
  ShieldCheck, 
  HelpCircle, 
  RotateCcw, 
  Plus, 
  Calendar, 
  UserPlus, 
  FileText, 
  DollarSign, 
  ChevronDown,
  Menu,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onOpenHelp: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenNewInvoice,
  onOpenNewExpense,
  onOpenHelp,
  onToggleMobileSidebar,
}) => {
  const { currentUser, users, switchUser, clearAllRecords } = useClinic();
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleClear = () => {
    if (window.confirm('Clear all patient and financial records for a fresh data-entry start?')) {
      clearAllRecords();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Single text element Brand wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          Sher Dental Clinic
        </span>
      </div>

      {/* Zone 2: Navigation Context / Breadcrumbs & Currency */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Practice Management</span>
        <span aria-hidden="true">/</span>
        <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          Currency: PKR
        </span>
        <span aria-hidden="true">/</span>
        <span>Owner: Dr. Sher Muhammad</span>
      </div>

      {/* Zone 3: Primary Actions and Staff Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Entry</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenNewPatient();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Register Patient</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenNewAppointment();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Schedule Appointment</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenNewInvoice();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Create Invoice (PKR)</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickMenu(false);
                  onOpenNewExpense();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 border-t border-slate-100"
              >
                <DollarSign className="w-4 h-4 text-rose-600" />
                <span>Record Expense (PKR)</span>
              </button>
            </div>
          )}
        </div>

        {/* Staff Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowTeamMenu(!showTeamMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            title="Switch logged-in staff member"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold hidden sm:inline">{currentUser.name}</span>
            <span className="text-slate-400 font-normal hidden lg:inline">({currentUser.title})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTeamMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-40 text-xs">
              <div className="px-2 py-1 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Sher Dental Clinic Team
              </div>
              <div className="space-y-1 my-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowTeamMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-md transition-colors flex flex-col ${
                      currentUser.id === u.id
                        ? 'bg-teal-50 border border-teal-200 text-teal-900 font-medium'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{u.name}</span>
                      {currentUser.id === u.id && (
                        <span className="text-[10px] text-teal-700 font-bold uppercase">Active</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal mt-0.5">{u.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset clean state */}
        <button
          onClick={handleClear}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title="Reset to clean state (0 records)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Help & System guide */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
          title="Clinic Setup & Staff Instructions"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
