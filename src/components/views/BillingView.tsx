import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Invoice, InvoiceStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Receipt,
  Search,
  Plus,
  Download,
  CreditCard,
  DollarSign,
  Trash2,
  Eye,
} from 'lucide-react';

interface BillingViewProps {
  onOpenNewInvoice: () => void;
  onRecordPayment: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  onOpenNewInvoice,
  onRecordPayment,
  onViewInvoice,
  onSelectPatient,
}) => {
  const { invoices, deleteInvoice, currentUser, exportCsv, formatPKR } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.dentistName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Aggregate metrics in PKR
  const totalBilled = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.remainingBalance, 0);
  const overdueTotal = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((sum, i) => sum + i.remainingBalance, 0);

  const handleDelete = (inv: Invoice) => {
    if (window.confirm(`Are you sure you want to void and remove invoice ${inv.invoiceNumber}?`)) {
      deleteInvoice(inv.id);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Invoice #',
      'Date',
      'Due Date',
      'Patient Name',
      'Attending Doctor',
      'Assistant Trainee',
      'Treatments Summary',
      'Grand Total (PKR)',
      'Amount Paid (PKR)',
      'Remaining Balance (PKR)',
      'Installment Plan',
      'Status',
    ];

    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.date,
      i.dueDate,
      i.patientName,
      i.dentistName,
      i.traineeName || '—',
      i.items.map((it) => `${it.treatmentName}${it.toothNumber ? ` (${it.toothNumber})` : ''}`).join('; '),
      i.grandTotal.toFixed(2),
      i.amountPaid.toFixed(2),
      i.remainingBalance.toFixed(2),
      i.isInstallmentPlan ? 'Yes' : 'No',
      i.status,
    ]);

    exportCsv('Sher_Dental_Clinic_Invoices_Ledger', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Header & New Invoice Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Invoices, Billing & Receipts (PKR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dental treatments billing, installment plans, and patient ledger in Pakistani Rupees (PKR)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onOpenNewInvoice}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial Metrics Bar (PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Total Invoiced</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatPKR(totalBilled)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Across all dental visits</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Payments Collected</span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {formatPKR(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-800/80 font-medium block mt-1">
            Settled via Cash, JazzCash, Bank
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Outstanding Balances</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {formatPKR(totalOutstanding)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Active patient receivables</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Past-Due / Overdue</span>
          <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
            {formatPKR(overdueTotal)}
          </span>
          <span className="text-[11px] text-rose-700/80 font-medium block mt-1">
            Overdue follow-ups ({invoices.filter((i) => i.status === 'Overdue').length} bills)
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, patient name, doctor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto">
          {(['all', 'Paid', 'Partial', 'Unpaid', 'Overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Treatments</th>
                <th className="py-3 px-3 text-right">Total (PKR)</th>
                <th className="py-3 px-3 text-right">Paid (PKR)</th>
                <th className="py-3 px-3 text-right">Balance (PKR)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Receipt className="w-8 h-8 text-teal-600 mx-auto opacity-70" />
                      <p className="font-semibold text-slate-700 text-sm">
                        {invoices.length === 0 ? 'No invoices created yet' : 'No invoices match your filter'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {invoices.length === 0
                          ? 'Generate your first itemized dental invoice with procedure fees in PKR and installment schedules.'
                          : 'Try clearing your search query or status filter.'}
                      </p>
                      {invoices.length === 0 && (
                        <button
                          onClick={onOpenNewInvoice}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create First Invoice (PKR)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Invoice ID & Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{inv.invoiceNumber}</span>
                        {inv.isInstallmentPlan && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-sans">
                            Installments
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Date: {inv.date} · Due: {inv.dueDate}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => onSelectPatient(inv.patientId)}
                        className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
                      >
                        {inv.patientName}
                      </button>
                      <div className="text-[11px] text-slate-500">
                        {inv.dentistName}
                        {inv.traineeName && <span> (Asst: {inv.traineeName})</span>}
                      </div>
                    </td>

                    {/* Treatments Summary */}
                    <td className="py-3.5 px-3 max-w-[200px]">
                      <div className="truncate text-slate-800 font-medium">
                        {inv.items[0]?.treatmentName}
                        {inv.items[0]?.toothNumber ? ` (${inv.items[0].toothNumber})` : ''}
                      </div>
                      {inv.items.length > 1 && (
                        <div className="text-[10px] text-slate-400">
                          +{inv.items.length - 1} other treatment(s)
                        </div>
                      )}
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatPKR(inv.grandTotal)}
                    </td>

                    {/* Amount Paid */}
                    <td className="py-3.5 px-3 text-right font-mono text-emerald-700 font-semibold tabular-nums">
                      {formatPKR(inv.amountPaid)}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={inv.remainingBalance > 0 ? 'text-rose-700' : 'text-slate-700'}>
                        {formatPKR(inv.remainingBalance)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={inv.status} type="invoice" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => onViewInvoice(inv.id)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        title="View / Print Invoice"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        <span>View</span>
                      </button>

                      {inv.remainingBalance > 0 && (
                        <button
                          onClick={() => onRecordPayment(inv.id)}
                          className="px-2.5 py-1 text-white bg-emerald-700 hover:bg-emerald-800 rounded font-semibold transition-colors"
                          title="Record payment receipt"
                        >
                          Pay
                        </button>
                      )}

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(inv)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Void invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
