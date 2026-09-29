import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ExpenseCategory } from '../../types';
import { X, DollarSign, Check } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, users, currentUser } = useClinic();

  const [date, setDate] = useState('2026-09-29');
  const [category, setCategory] = useState<ExpenseCategory>('Dental Supplies & Consumables');
  const [amount, setAmount] = useState<number | ''>('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [recordedBy, setRecordedBy] = useState(currentUser.name);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) errs.amount = 'Valid expense amount in PKR required';
    if (!vendor.trim()) errs.vendor = 'Vendor / Payee name is required';
    if (!description.trim()) errs.description = 'Expense description is required';
    if (!date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addExpense({
      date,
      category,
      amount: Number(amount),
      vendor: vendor.trim(),
      description: description.trim(),
      paymentMethod,
      recordedBy: recordedBy || currentUser.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <span>Record Clinic Operating Expense (PKR)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Log facility rent, dental supplies, dental lab charges, utilities, or staff payments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Amount (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono font-bold text-xs">PKR</span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 3500"
                  className={`w-full pl-12 pr-3 py-2 rounded-lg border text-xs font-mono tabular-nums font-bold focus:ring-2 focus:ring-teal-500 ${
                    errors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-[11px] text-rose-600 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                <option value="Cash">Cash</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank Transfer">Bank Transfer / Raast</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Payee / Vendor / Supplier *
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Dental Mart, Glidewell Lab, WAPDA"
                className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-teal-500 ${
                  errors.vendor ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.vendor && <p className="text-[11px] text-rose-600 mt-1">{errors.vendor}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Recorded By *
              </label>
              <select
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Description / Memo *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Purchase of 5 packs lidocaine cartridges and sterile dental burs"
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-teal-500 ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
