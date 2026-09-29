import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../common/Badge';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface ReportsViewProps {
  onRecordPayment: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onRecordPayment,
  onViewInvoice,
  onSelectPatient,
}) => {
  const { payments, expenses, invoices, treatments, users, exportCsv, formatPKR } = useClinic();

  // Date Range Presets
  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'week' | 'month' | 'year' | 'all' | 'custom'>('month');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'treatment' | 'dentist' | 'aging'>('pnl');

  const applyPreset = (preset: typeof dateRangePreset) => {
    setDateRangePreset(preset);
    const today = '2026-09-29';
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'week') {
      setStartDate('2026-09-22');
      setEndDate('2026-09-29');
    } else if (preset === 'month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (preset === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    } else if (preset === 'all') {
      setStartDate('2025-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Filtered dataset within active date range
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => p.date >= startDate && p.date <= endDate);
  }, [payments, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
  }, [expenses, startDate, endDate]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.date >= startDate && inv.date <= endDate);
  }, [invoices, startDate, endDate]);

  // Aggregate Executive KPIs in PKR
  const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const marginPercent = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const overdueInvoices = invoices.filter(
    (i) => i.status === 'Overdue' || (i.remainingBalance > 0 && i.dueDate < '2026-09-29')
  );
  const totalOverdueBalance = overdueInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  // 1. P&L by Day aggregation
  const pnlBreakdown = useMemo(() => {
    const datesMap: Record<string, { income: number; expenses: number }> = {};

    filteredPayments.forEach((p) => {
      datesMap[p.date] = datesMap[p.date] || { income: 0, expenses: 0 };
      datesMap[p.date].income += p.amount;
    });

    filteredExpenses.forEach((e) => {
      datesMap[e.date] = datesMap[e.date] || { income: 0, expenses: 0 };
      datesMap[e.date].expenses += e.amount;
    });

    const entries = Object.entries(datesMap)
      .map(([date, vals]) => ({
        date,
        income: vals.income,
        expenses: vals.expenses,
        net: vals.income - vals.expenses,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return entries;
  }, [filteredPayments, filteredExpenses]);

  // 2. Revenue breakdown by treatment
  const treatmentBreakdown = useMemo(() => {
    const map: Record<string, { name: string; category: string; count: number; totalBilled: number }> = {};

    filteredInvoices.forEach((inv) => {
      inv.items.forEach((it) => {
        const key = it.treatmentName;
        const catalogItem = treatments.find((t) => t.name === key);
        const cat = catalogItem ? catalogItem.category : 'General Dental';

        map[key] = map[key] || { name: key, category: cat, count: 0, totalBilled: 0 };
        map[key].count += it.quantity;
        map[key].totalBilled += it.total;
      });
    });

    return Object.values(map).sort((a, b) => b.totalBilled - a.totalBilled);
  }, [filteredInvoices, treatments]);

  // 3. Revenue breakdown by dentist & trainee
  const dentistBreakdown = useMemo(() => {
    const map: Record<string, { id: string; name: string; title: string; invoicesCount: number; totalBilled: number; totalCollected: number }> = {};

    users.forEach((u) => {
      map[u.id] = { id: u.id, name: u.name, title: u.title, invoicesCount: 0, totalBilled: 0, totalCollected: 0 };
    });

    filteredInvoices.forEach((inv) => {
      if (map[inv.dentistId]) {
        map[inv.dentistId].invoicesCount += 1;
        map[inv.dentistId].totalBilled += inv.grandTotal;
        map[inv.dentistId].totalCollected += inv.amountPaid;
      }
    });

    return Object.values(map);
  }, [filteredInvoices, users]);

  // 4. Overdue Aging Analysis
  const agingList = useMemo(() => {
    const today = new Date('2026-09-29').getTime();
    return overdueInvoices.map((inv) => {
      const dueTime = new Date(inv.dueDate).getTime();
      const diffDays = Math.max(0, Math.floor((today - dueTime) / (1000 * 60 * 60 * 24)));
      return {
        ...inv,
        daysOverdue: diffDays,
      };
    }).sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [overdueInvoices]);

  // CSV Exporters with PKR labels
  const handleExportPnL = () => {
    const headers = ['Date', 'Income / Collections (PKR)', 'Operating Expenses (PKR)', 'Net Profit (PKR)'];
    const rows = pnlBreakdown.map((r) => [
      r.date,
      r.income.toFixed(2),
      r.expenses.toFixed(2),
      r.net.toFixed(2),
    ]);
    exportCsv(`Sher_Dental_PnL_${startDate}_to_${endDate}_PKR`, headers, rows);
  };

  const handleExportTreatments = () => {
    const headers = ['Treatment / Procedure', 'Category', 'Count', 'Revenue Invoiced (PKR)'];
    const rows = treatmentBreakdown.map((t) => [
      t.name,
      t.category,
      t.count,
      t.totalBilled.toFixed(2),
    ]);
    exportCsv(`Sher_Dental_Revenue_By_Treatment_${startDate}_to_${endDate}_PKR`, headers, rows);
  };

  const handleExportDentists = () => {
    const headers = ['Staff Member', 'Role / Title', 'Invoices', 'Total Invoiced (PKR)', 'Collections Received (PKR)'];
    const rows = dentistBreakdown.map((d) => [
      d.name,
      d.title,
      d.invoicesCount,
      d.totalBilled.toFixed(2),
      d.totalCollected.toFixed(2),
    ]);
    exportCsv(`Sher_Dental_Staff_Productivity_${startDate}_to_${endDate}_PKR`, headers, rows);
  };

  const handleExportAging = () => {
    const headers = ['Patient Name', 'Invoice #', 'Issue Date', 'Due Date', 'Days Overdue', 'Remaining Balance (PKR)'];
    const rows = agingList.map((a) => [
      a.patientName,
      a.invoiceNumber,
      a.date,
      a.dueDate,
      a.daysOverdue,
      a.remainingBalance.toFixed(2),
    ]);
    exportCsv('Sher_Dental_Overdue_Aging_PKR', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Financial & Productivity Reports (PKR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real income ledger, clinic expenses, staff productivity, and overdue accounts for Sher Dental Clinic
          </p>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 p-1 rounded-lg text-xs">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                dateRangePreset === p
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'Past 7 Days' : p === 'month' ? 'This Month' : p === 'year' ? 'Year 2026' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Custom Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-slate-700">Reporting Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setDateRangePreset('custom');
            }}
            className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setDateRangePreset('custom');
            }}
            className="px-2.5 py-1 rounded border border-slate-300 font-mono text-xs"
          />
        </div>

        <div className="text-[11px] text-slate-500">
          Showing real entries from <span className="font-mono font-medium text-slate-700">{startDate}</span> to{' '}
          <span className="font-mono font-medium text-slate-700">{endDate}</span>
        </div>
      </div>

      {/* Executive Financial Metrics Cards (All PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <span className="text-slate-500 text-xs block font-medium">Income / Collections (PKR)</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatPKR(totalIncome)}
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {filteredPayments.length} payment receipts recorded
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <span className="text-slate-500 text-xs block font-medium">Operating Expenses (PKR)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatPKR(totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {filteredExpenses.length} expense entries recorded
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <span className="text-slate-500 text-xs block font-medium">Net Practice Profit (PKR)</span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatPKR(netProfit)}
          </div>
          <span className="text-[11px] text-slate-500 block font-mono font-medium">
            Margin: {marginPercent}%
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1.5">
          <span className="text-slate-500 text-xs block font-medium">Overdue Patient Balances</span>
          <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {formatPKR(totalOverdueBalance)}
          </div>
          <span className="text-[11px] text-rose-800/80 block font-medium">
            Across {overdueInvoices.length} overdue patient accounts
          </span>
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50/50 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveReportTab('pnl')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeReportTab === 'pnl'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Income vs Expenses (P&L)
            </button>
            <button
              onClick={() => setActiveReportTab('treatment')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeReportTab === 'treatment'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Revenue by Treatment
            </button>
            <button
              onClick={() => setActiveReportTab('dentist')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeReportTab === 'dentist'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Team Productivity
            </button>
            <button
              onClick={() => setActiveReportTab('aging')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeReportTab === 'aging'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overdue Aging Accounts ({agingList.length})
            </button>
          </div>

          <div>
            {activeReportTab === 'pnl' && pnlBreakdown.length > 0 && (
              <button
                onClick={handleExportPnL}
                className="px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export P&L (CSV)</span>
              </button>
            )}
            {activeReportTab === 'treatment' && treatmentBreakdown.length > 0 && (
              <button
                onClick={handleExportTreatments}
                className="px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Treatments (CSV)</span>
              </button>
            )}
            {activeReportTab === 'dentist' && (
              <button
                onClick={handleExportDentists}
                className="px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Team Report (CSV)</span>
              </button>
            )}
            {activeReportTab === 'aging' && agingList.length > 0 && (
              <button
                onClick={handleExportAging}
                className="px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Aging (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: P&L Timeline */}
        {activeReportTab === 'pnl' && (
          <div className="p-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Income (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Expenses (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Net Profit (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pnlBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      No income or expense transactions recorded in this date range.
                    </td>
                  </tr>
                ) : (
                  pnlBreakdown.map((row) => (
                    <tr key={row.date} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                        {formatPKR(row.income)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                        {formatPKR(row.expenses)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                          row.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatPKR(row.net)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-200 font-bold bg-slate-50/50">
                <tr>
                  <td className="py-3 px-3 text-slate-900">Period Total</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums">
                    {formatPKR(totalIncome)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 tabular-nums">
                    {formatPKR(totalExpenses)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums ${
                      netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatPKR(netProfit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Tab 2: Revenue by Treatment */}
        {activeReportTab === 'treatment' && (
          <div className="p-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Treatment / Procedure</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Cases Done</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced (PKR)</th>
                  <th className="py-2.5 px-3 text-right">% of Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treatmentBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No treatment invoices recorded in this date range.
                    </td>
                  </tr>
                ) : (
                  treatmentBreakdown.map((t) => {
                    const share =
                      totalIncome > 0
                        ? Math.round((t.totalBilled / totalIncome) * 100)
                        : 0;
                    return (
                      <tr key={t.name} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{t.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{t.category}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{t.count}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatPKR(t.totalBilled)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                          {share}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Revenue by Dentist & Team Member */}
        {activeReportTab === 'dentist' && (
          <div className="p-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Clinic Designation</th>
                  <th className="py-2.5 px-3 text-center">Invoiced Visits</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Collections Received (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dentistBreakdown.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-600" />
                      <span>{d.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{d.title}</td>
                    <td className="py-3 px-3 text-center font-mono">{d.invoicesCount}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatPKR(d.totalBilled)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-semibold tabular-nums">
                      {formatPKR(d.totalCollected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Overdue Aging */}
        {activeReportTab === 'aging' && (
          <div className="p-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-center">Days Overdue</th>
                  <th className="py-2.5 px-3 text-right">Remaining Balance (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agingList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No overdue accounts! All patient receivables are current.
                    </td>
                  </tr>
                ) : (
                  agingList.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <button
                          onClick={() => onSelectPatient(a.patientId)}
                          className="hover:text-teal-700"
                        >
                          {a.patientName}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono">{a.invoiceNumber}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{a.dueDate}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                          {a.daysOverdue} days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                        {formatPKR(a.remainingBalance)}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => onViewInvoice(a.id)}
                          className="px-2 py-1 border border-slate-200 rounded text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onRecordPayment(a.id)}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
