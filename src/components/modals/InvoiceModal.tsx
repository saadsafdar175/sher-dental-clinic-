import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InvoiceItem, Installment, Patient, Appointment, Payment } from '../../types';
import { X, Plus, Trash2, Receipt, Calendar, CreditCard, DollarSign, Check, AlertCircle } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatient?: Patient | null;
  preselectedAppointment?: Appointment | null;
  onInvoiceCreated?: (invoiceId: string) => void;
  onOpenNewPatient?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  preselectedPatient,
  preselectedAppointment,
  onInvoiceCreated,
  onOpenNewPatient,
}) => {
  const { patients, users, treatments, createInvoice, formatPKR } = useClinic();

  const dentists = users.filter((u) => u.role === 'dentist' || u.role === 'admin');
  const trainees = users.filter((u) => u.role === 'trainee');

  const [patientId, setPatientId] = useState('');
  const [dentistId, setDentistId] = useState('');
  const [traineeId, setTraineeId] = useState('');
  const [date, setDate] = useState('2026-09-29');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [appointmentId, setAppointmentId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Itemized treatments
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `item-${Date.now()}`,
      treatmentName: 'Dental Consultation & Oral Examination',
      toothNumber: '',
      quantity: 1,
      unitPrice: 500, // PKR
      discount: 0,
      total: 500,
    },
  ]);

  const [globalDiscount, setGlobalDiscount] = useState<number | ''>('');

  // Installment plan
  const [isInstallmentPlan, setIsInstallmentPlan] = useState(false);
  const [numInstallments, setNumInstallments] = useState(2);
  const [installments, setInstallments] = useState<Installment[]>([]);

  // Initial payment
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('Cash');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedPatient) {
      setPatientId(preselectedPatient.id);
    } else if (patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }

    if (preselectedAppointment) {
      setAppointmentId(preselectedAppointment.id);
      setDentistId(preselectedAppointment.dentistId);
      setTraineeId(preselectedAppointment.traineeId || '');
      setDate(preselectedAppointment.date);
    } else if (dentists.length > 0 && !dentistId) {
      setDentistId(dentists[0].id);
    }
  }, [preselectedPatient, preselectedAppointment, patients, dentists, isOpen]);

  // Recalculate item line totals
  const handleItemChange = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };

    if (field === 'treatmentName') {
      const match = treatments.find((t) => t.name === val);
      if (match) {
        current.unitPrice = match.defaultFee;
      }
    }

    const qty = Number(current.quantity) || 1;
    const price = Number(current.unitPrice) || 0;
    const disc = Number(current.discount) || 0;
    current.total = Math.max(0, qty * price - disc);

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    const defaultTreatment = treatments[0] || { name: 'Dental Procedure', defaultFee: 1000 };
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        treatmentName: defaultTreatment.name,
        toothNumber: '',
        quantity: 1,
        unitPrice: defaultTreatment.defaultFee,
        discount: 0,
        total: defaultTreatment.defaultFee,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations in PKR
  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const itemsDiscount = items.reduce((acc, curr) => acc + curr.discount, 0);
  const totalDiscounts = itemsDiscount + (Number(globalDiscount) || 0);
  const grandTotal = Math.max(0, subtotal - totalDiscounts);
  const initialPayNum = Number(initialPaymentAmount) || 0;
  const remainingBalance = Math.max(0, grandTotal - initialPayNum);

  // Recalculate installments whenever grandTotal or numInstallments changes
  useEffect(() => {
    if (!isInstallmentPlan) {
      setInstallments([]);
      return;
    }

    const n = Math.max(2, Math.min(12, numInstallments));
    const amountToFinance = Math.max(0, grandTotal - initialPayNum);
    const perInstallment = Math.round(amountToFinance / n);

    const baseDate = new Date(date);
    const schedule: Installment[] = [];

    for (let i = 1; i <= n; i++) {
      const dueDateObj = new Date(baseDate);
      dueDateObj.setDate(dueDateObj.getDate() + i * 30);
      const dueDateStr = dueDateObj.toISOString().split('T')[0];

      const isLast = i === n;
      const thisAmount = isLast
        ? Math.max(0, amountToFinance - perInstallment * (n - 1))
        : perInstallment;

      schedule.push({
        id: `inst-calc-${i}`,
        installmentNumber: i,
        dueDate: dueDateStr,
        amount: thisAmount,
        status: 'Pending',
      });
    }

    setInstallments(schedule);
  }, [isInstallmentPlan, numInstallments, grandTotal, initialPayNum, date]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!patientId) errs.patientId = 'Please select a patient';
    if (!dentistId) errs.dentistId = 'Please select attending doctor';
    if (!date) errs.date = 'Invoice date is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (items.length === 0) errs.items = 'At least one treatment item is required';
    if (initialPayNum > grandTotal) {
      errs.initialPayment = 'Initial payment cannot exceed invoice total';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const patient = patients.find((p) => p.id === patientId);
    const dentist = users.find((d) => d.id === dentistId);
    const trainee = users.find((t) => t.id === traineeId);

    if (!patient || !dentist) return;

    const created = createInvoice({
      patientId: patient.id,
      patientName: patient.name,
      appointmentId,
      dentistId: dentist.id,
      dentistName: dentist.name,
      traineeId: trainee ? trainee.id : undefined,
      traineeName: trainee ? trainee.name : undefined,
      date,
      dueDate,
      items,
      subtotal,
      discountTotal: totalDiscounts,
      tax: 0,
      grandTotal,
      isInstallmentPlan,
      installments: isInstallmentPlan ? installments : undefined,
      notes: notes.trim(),
      initialPaymentAmount: initialPayNum,
      paymentMethod: initialPayNum > 0 ? paymentMethod : undefined,
    });

    if (onInvoiceCreated) {
      onInvoiceCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-teal-700" />
              <span>Create Itemized Dental Invoice (PKR)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record treatments, tooth numbers, PKR fees, and flexible installment plans
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Patient & Staff Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Patient *</label>
                {patients.length === 0 && onOpenNewPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewPatient();
                    }}
                    className="text-teal-700 hover:underline text-[11px]"
                  >
                    + Register Patient First
                  </button>
                )}
              </div>
              {patients.length === 0 ? (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  No patient files exist. Please register a patient before issuing an invoice.
                </div>
              ) : (
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientId}) - {p.phone}
                    </option>
                  ))}
                </select>
              )}
              {errors.patientId && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.patientId}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Attending Dentist *
              </label>
              <select
                value={dentistId}
                onChange={(e) => setDentistId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {dentists.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Assisting Trainee Worker
              </label>
              <select
                value={traineeId}
                onChange={(e) => setTraineeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="">None / Direct Care</option>
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Trainee Worker)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Invoice Date *
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
                Payment Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>

          {/* Itemized Treatments Table */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Itemized Dental Procedures & Fees (PKR)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Procedure</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-12 sm:col-span-5">
                    <label className="text-[10px] text-slate-500 font-medium block">
                      Procedure / Treatment
                    </label>
                    <input
                      type="text"
                      list="treatment-catalog-list"
                      value={item.treatmentName}
                      onChange={(e) => handleItemChange(idx, 'treatmentName', e.target.value)}
                      placeholder="Type or select treatment"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-medium block">
                      Tooth # (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.toothNumber || ''}
                      onChange={(e) => handleItemChange(idx, 'toothNumber', e.target.value)}
                      placeholder="#14 / Upper Arch"
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-medium block">
                      Fee (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono tabular-nums font-semibold"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label className="text-[10px] text-slate-500 font-medium block">
                      Disc. (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono tabular-nums"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <datalist id="treatment-catalog-list">
              {treatments.map((t) => (
                <option key={t.id} value={t.name}>
                  PKR {t.defaultFee} - {t.category}
                </option>
              ))}
            </datalist>
          </div>

          {/* Totals Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2 max-w-xs">
              <label className="block text-slate-700 font-medium">Remarks / Agreement Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, follow-up dates, payment agreement..."
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
              />
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium tabular-nums">{formatPKR(subtotal)}</span>
              </div>
              {totalDiscounts > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discounts:</span>
                  <span className="font-mono font-medium tabular-nums">-{formatPKR(totalDiscounts)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-900 pt-1 border-t border-slate-200 font-bold">
                <span className="text-sm">Grand Total (PKR):</span>
                <span className="font-mono text-base text-teal-800 tabular-nums">
                  {formatPKR(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Installment Plan Toggle */}
          <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Installment Payment Plan</span>
                <span className="text-[11px] text-slate-500">
                  Split treatment balance into scheduled monthly payments in PKR
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstallmentPlan}
                  onChange={(e) => setIsInstallmentPlan(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
              </label>
            </div>

            {isInstallmentPlan && (
              <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-slate-700 font-medium">Number of Monthly Installments:</span>
                  <select
                    value={numInstallments}
                    onChange={(e) => setNumInstallments(Number(e.target.value))}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-mono"
                  >
                    <option value={2}>2 Installments</option>
                    <option value={3}>3 Installments</option>
                    <option value={4}>4 Installments</option>
                    <option value={6}>6 Installments</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-700 text-[11px] mb-1">
                    Scheduled PKR Breakdown:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {installments.map((inst) => (
                      <div
                        key={inst.id}
                        className="bg-white p-2 rounded border border-slate-200 text-center"
                      >
                        <span className="text-[10px] text-slate-500 block">
                          Due {inst.dueDate}
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                          {formatPKR(inst.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Immediate Payment on Visit (Optional) */}
          <div className="p-4 border border-teal-200 bg-teal-50/40 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-700" />
              Collect Initial Payment / Advance Today (Optional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Amount Received Now (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  step="50"
                  value={initialPaymentAmount}
                  onChange={(e) => setInitialPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono tabular-nums font-bold"
                />
                {errors.initialPayment && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.initialPayment}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment['paymentMethod'])}
                  disabled={!initialPayNum || initialPayNum <= 0}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs disabled:opacity-50"
                >
                  <option value="Cash">Cash</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank Transfer">Bank Transfer / Raast</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 text-xs">
              <span className="text-slate-600">Remaining Balance:</span>
              <span
                className={`font-mono font-bold text-sm tabular-nums ${
                  remainingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                {formatPKR(remainingBalance)}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={patients.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Issue Invoice ({formatPKR(grandTotal)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
