import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Payment } from '../../types';
import { X, CreditCard, DollarSign, Check, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
}) => {
  const { invoices, recordPayment, users, currentUser, formatPKR } = useClinic();

  const invoice = invoices.find((inv) => inv.id === invoiceId);

  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Cash');
  const [reference, setReference] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.remainingBalance);
      setReference(`RCP-${Date.now().toString().slice(-6)}`);
      setReceivedBy(currentUser.name);
      setNotes('');
      setError('');
    }
  }, [invoice, currentUser, isOpen]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than PKR 0');
      return;
    }

    if (numAmount > invoice.remainingBalance) {
      setError(`Payment cannot exceed remaining balance of ${formatPKR(invoice.remainingBalance)}`);
      return;
    }

    try {
      recordPayment({
        invoiceId: invoice.id,
        amount: numAmount,
        paymentMethod,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        receivedBy: receivedBy || currentUser.name,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment recording failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Record Patient Payment (PKR)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Apply payment towards patient invoice balance in Pakistani Rupees
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary in PKR */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Patient:</span>
            <span className="font-bold text-slate-900">{invoice.patientName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Invoice Number:</span>
            <span className="font-mono font-medium text-slate-800">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Grand Total:</span>
            <span className="font-mono text-slate-700 tabular-nums">
              {formatPKR(invoice.grandTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Already Settled:</span>
            <span className="font-mono text-emerald-700 tabular-nums font-semibold">
              {formatPKR(invoice.amountPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="font-bold text-slate-800">Remaining Balance:</span>
            <span className="font-mono font-bold text-rose-700 text-sm tabular-nums">
              {formatPKR(invoice.remainingBalance)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-slate-700">Amount Received (PKR) *</label>
              <button
                type="button"
                onClick={() => setAmount(invoice.remainingBalance)}
                className="text-[11px] text-teal-700 hover:underline font-medium"
              >
                Pay Full ({formatPKR(invoice.remainingBalance)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs font-bold">
                PKR
              </span>
              <input
                type="number"
                min="1"
                max={invoice.remainingBalance}
                step="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-12 pr-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-semibold tabular-nums focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                <option value="Cash">Cash (Desk)</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank Transfer">Bank Transfer / Raast</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Received By *
              </label>
              <select
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
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
              Receipt / Transaction Reference (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. JazzCash TID: 09848392 or Cash Receipt #1"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Payment Remarks (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1st installment paid in cash"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
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
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Receipt ({formatPKR(Number(amount) || 0)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
