import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  CreditCard,
  Plus,
  Download,
  Trash2,
  DollarSign,
} from 'lucide-react';

interface ExpensesViewProps {
  onOpenNewExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenNewExpense }) => {
  const { expenses, deleteExpense, currentUser, exportCsv, formatPKR } = useClinic();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: ExpenseCategory[] = [
    'Rent & Premises',
    'Staff Salaries & Stipends',
    'Dental Supplies & Consumables',
    'Dental Lab Charges',
    'Electricity & Utilities',
    'Equipment Maintenance & Sterilization',
    'Office, Tea & Sundries',
    'Marketing & Signage',
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.description.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.recordedBy.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for visual distribution
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const allExpensesTotal = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

  const handleDelete = (exp: Expense) => {
    if (window.confirm(`Delete expense record of ${formatPKR(exp.amount)} (${exp.description})?`)) {
      deleteExpense(exp.id);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Category', 'Description', 'Vendor / Payee', 'Amount (PKR)', 'Payment Method', 'Recorded By'];
    const rows = filteredExpenses.map((e) => [
      e.date,
      e.category,
      e.description,
      e.vendor,
      e.amount.toFixed(2),
      e.paymentMethod,
      e.recordedBy,
    ]);
    exportCsv('Sher_Dental_Clinic_Expenses_PKR', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Expense Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Clinic Operating Expenses (PKR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record and categorize clinic premises, lab fees, utilities, dental consumables, and staff stipends
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onOpenNewExpense}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense (PKR)</span>
          </button>
        </div>
      </div>

      {/* Category Breakdown Progress Grid */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Consolidated Expense Breakdown (PKR)
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
            Total Spent: {formatPKR(allExpensesTotal)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {categories.map((cat) => {
            const amount = categoryTotals[cat] || 0;
            const pct = allExpensesTotal > 0 ? Math.round((amount / allExpensesTotal) * 100) : 0;
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'border-rose-300 bg-rose-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-slate-800 truncate text-[11px]">{cat}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{pct}%</span>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                  {formatPKR(amount)}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1 mt-2 overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by vendor, description, or staff..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Vendor / Payee</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Recorded By</th>
                <th className="py-3 px-3 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <CreditCard className="w-8 h-8 text-rose-600 mx-auto opacity-70" />
                      <p className="font-semibold text-slate-700 text-sm">
                        {expenses.length === 0 ? 'No expenses recorded yet' : 'No expenses match your search'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {expenses.length === 0
                          ? 'Track daily clinic operating expenditures, lab bills, and consumables in Pakistani Rupees.'
                          : 'Try changing category or clearing your search.'}
                      </p>
                      {expenses.length === 0 && (
                        <button
                          onClick={onOpenNewExpense}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Record First Expense (PKR)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{exp.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{exp.category}</td>
                    <td className="py-3 px-3 max-w-xs text-slate-700">{exp.description}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{exp.vendor}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {exp.recordedBy}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                      {formatPKR(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(exp)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50/60 font-bold border-t border-slate-200">
              <tr>
                <td colSpan={6} className="py-3 px-4 text-slate-900">
                  Total Active Expenditures
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-700 tabular-nums text-sm">
                  {formatPKR(totalSpent)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
