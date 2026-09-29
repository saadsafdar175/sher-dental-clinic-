import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../common/Badge';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  CreditCard,
  Package,
  Plus,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onSelectPatient: (patientId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenNewInvoice,
  onOpenNewExpense,
  onSelectPatient,
  onViewInvoice,
  onNavigateTab,
}) => {
  const { appointments, payments, invoices, expenses, inventory, updateAppointmentStatus, formatPKR, clinicProfile, currentUser } = useClinic();

  const todayStr = '2026-09-29';
  const currentMonthStr = '2026-09';

  // Metrics
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const todayCompleted = todayAppointments.filter((a) => a.status === 'Completed').length;
  const todayCheckedIn = todayAppointments.filter((a) => a.status === 'Checked In').length;

  const todayPayments = payments
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  const monthPayments = payments
    .filter((p) => p.date.startsWith(currentMonthStr))
    .reduce((sum, p) => sum + p.amount, 0);

  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthNetProfit = monthPayments - monthExpenses;

  const totalUnpaidBalances = invoices
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);

  const overdueInvoices = invoices.filter(
    (inv) => inv.status === 'Overdue' || (inv.remainingBalance > 0 && inv.dueDate < todayStr)
  );
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minStockLevel);

  return (
    <div className="space-y-6">
      {/* Clinic Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {clinicProfile.name}
            </h1>
            <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
              All Figures in PKR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.title}) · Practice Owner: Dr. Sher Muhammad
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenNewPatient}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={onOpenNewAppointment}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Schedule Visit</span>
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Issue Invoice (PKR)</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Inventory Low Stock Alert:</span> {lowStockItems.length} dental supplies
              need restock: <span className="text-rose-700 font-medium">{lowStockItems.map((i) => i.name).join(', ')}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-1 text-xs font-semibold text-rose-800 bg-white border border-rose-300 hover:bg-rose-100/50 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Manage Supplies →
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards (All in PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Today's Visits</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-500">
              ({todayCompleted} done · {todayAppointments.length - todayCompleted} pending)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all"
              style={{
                width: `${
                  todayAppointments.length > 0
                    ? (todayCompleted / todayAppointments.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Payments Collected Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Collections Today (PKR)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {formatPKR(todayPayments)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Month total: <strong className="font-mono text-slate-700 tabular-nums">{formatPKR(monthPayments)}</strong>
          </div>
        </div>

        {/* Unpaid Patient Balances */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Unpaid Receivables</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {formatPKR(totalUnpaidBalances)}
            </span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium">
            Overdue: {formatPKR(overdueTotal)} ({overdueInvoices.length} invoices)
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Monthly Net Profit (PKR)</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold font-mono tabular-nums ${
                monthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatPKR(monthNetProfit)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Income: <span className="font-mono">{formatPKR(monthPayments)}</span> · Expenses: <span className="font-mono">{formatPKR(monthExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Today's Operatory Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Queue and status of appointments for today ({todayAppointments.length} total)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <span>View All Appointments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs space-y-2">
              <p className="font-medium text-slate-600">No appointments scheduled for today.</p>
              <p className="text-[11px] text-slate-400">Click below to book a patient visit for Dr. Sher Muhammad, Dr. Zeeshan, or Dr. Rahmatullah.</p>
              <button
                onClick={onOpenNewAppointment}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule First Visit</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="font-mono font-bold text-slate-800 block text-xs">
                        {apt.time}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {apt.durationMinutes}m
                      </span>
                    </div>

                    <div>
                      <button
                        onClick={() => onSelectPatient(apt.patientId)}
                        className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
                      >
                        {apt.patientName}
                      </button>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        <span>{apt.type}</span>
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span className="text-teal-800 font-medium">{apt.dentistName}</span>
                        {apt.traineeName && (
                          <>
                            <span aria-hidden="true" className="mx-1.5">·</span>
                            <span className="text-slate-500">Asst: {apt.traineeName}</span>
                          </>
                        )}
                        <span aria-hidden="true" className="mx-1.5">·</span>
                        <span className="text-slate-400 font-mono">{apt.operatory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={apt.status} type="appointment" />

                    {apt.status === 'Scheduled' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                        className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100"
                      >
                        Check In
                      </button>
                    )}
                    {apt.status === 'Checked In' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                        className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial & Clinical Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monthly Financial Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Monthly Financial Summary (PKR)
                </h2>
                <p className="text-xs text-slate-500">Live P&L calculations</p>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              >
                <span>Full Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Revenue Collected</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {formatPKR(monthPayments)}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Cashflow In
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block text-[11px]">Clinic Operating Expenses</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {formatPKR(monthExpenses)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Expenses Out
                </span>
              </div>

              <div className="p-3.5 bg-teal-50/50 rounded-lg border border-teal-200 flex justify-between items-center">
                <div>
                  <span className="text-teal-900 font-semibold block text-[11px]">
                    Net Operating Profit
                  </span>
                  <span
                    className={`font-mono font-bold text-base tabular-nums ${
                      monthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatPKR(monthNetProfit)}
                  </span>
                </div>
                <span className="text-[11px] text-teal-800 font-mono font-medium">
                  {monthPayments > 0
                    ? `${Math.round((monthNetProfit / monthPayments) * 100)}% margin`
                    : 'PKR 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Overdue / Outstanding Balances Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Pending Patient Balances (PKR)
              </h2>
              <button
                onClick={() => onNavigateTab('billing')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                Invoices →
              </button>
            </div>

            {overdueInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No past-due accounts. All patient invoices are settled or pending visit.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {overdueInvoices.slice(0, 3).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.invoiceNumber} · Due {inv.dueDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-700 tabular-nums">
                        {formatPKR(inv.remainingBalance)}
                      </div>
                      <button
                        onClick={() => onViewInvoice(inv.id)}
                        className="text-[10px] text-teal-700 hover:underline font-medium"
                      >
                        Inspect Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
