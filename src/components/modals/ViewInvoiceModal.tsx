import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../common/Badge';
import { X, Printer, DollarSign } from 'lucide-react';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  onRecordPayment: (invoiceId: string) => void;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  onRecordPayment,
}) => {
  const { invoices, payments, clinicProfile, getPatientById, formatPKR } = useClinic();

  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!isOpen || !invoice) return null;

  const patient = getPatientById(invoice.patientId);
  const invoicePayments = payments.filter((p) => p.invoiceId === invoice.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Action Bar (Hidden in Print) */}
        <div className="no-print px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Invoice: {invoice.invoiceNumber}
            </span>
            <StatusBadge status={invoice.status} type="invoice" />
          </div>

          <div className="flex items-center gap-2">
            {invoice.remainingBalance > 0 && (
              <button
                onClick={() => onRecordPayment(invoice.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Collect Payment</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-md border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 text-slate-800 text-xs space-y-6 max-h-[82vh] overflow-y-auto bg-white">
          {/* Clinic Branding Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-700 inline-block"></span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {clinicProfile.name}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">{clinicProfile.tagline}</p>
              <p className="text-[11px] text-slate-500 mt-1">{clinicProfile.address}</p>
              <p className="text-[11px] text-slate-500">
                Phone: {clinicProfile.phone} · Email: {clinicProfile.email}
              </p>
              {clinicProfile.taxNumber && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Clinic NTN / Reg: {clinicProfile.taxNumber}
                </p>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="text-lg font-mono font-bold text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500">
                Issue Date: <strong className="text-slate-700">{invoice.date}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Due Date: <strong className="text-slate-700">{invoice.dueDate}</strong>
              </div>
              <div className="pt-1">
                <StatusBadge status={invoice.status} type="invoice" size="md" />
              </div>
            </div>
          </div>

          {/* Patient & Staff Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Patient Information
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {invoice.patientName}
              </div>
              {patient && (
                <>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    MR / Patient ID: <span className="font-mono">{patient.patientId}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Phone: <span className="font-mono">{patient.phone}</span>
                  </div>
                  {patient.address && (
                    <div className="text-[11px] text-slate-600">{patient.address}</div>
                  )}
                </>
              )}
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Clinical Care Team
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {invoice.dentistName}
              </div>
              {invoice.traineeName && (
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Assisting Trainee: <span className="font-medium text-slate-800">{invoice.traineeName}</span>
                </div>
              )}
              {invoice.notes && (
                <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                  <span className="font-medium text-slate-700">Remarks:</span> {invoice.notes}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Procedures Table in PKR */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5">Dental Procedure / Service</th>
                  <th className="py-2.5">Tooth #</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Fee (PKR)</th>
                  <th className="py-2.5 text-right">Discount</th>
                  <th className="py-2.5 text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-slate-900">{item.treatmentName}</td>
                    <td className="py-3 font-mono text-slate-600">{item.toothNumber || '—'}</td>
                    <td className="py-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 text-right font-mono tabular-nums">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-500 tabular-nums">
                      {item.discount > 0 ? `-${formatPKR(item.discount)}` : '—'}
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatPKR(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary Totals (PKR) */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatPKR(invoice.subtotal)}</span>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discounts Applied:</span>
                  <span className="font-mono tabular-nums">
                    -{formatPKR(invoice.discountTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                <span>Grand Total (PKR):</span>
                <span className="font-mono tabular-nums text-teal-800 font-bold">
                  {formatPKR(invoice.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Amount Paid:</span>
                <span className="font-mono tabular-nums">
                  -{formatPKR(invoice.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-slate-200">
                <span>Balance Due:</span>
                <span className="font-mono tabular-nums text-sm">
                  {formatPKR(invoice.remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Installment Plan Schedule (if applicable) */}
          {invoice.isInstallmentPlan && invoice.installments && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                Installment Payment Schedule (PKR)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {invoice.installments.map((inst) => (
                  <div
                    key={inst.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      inst.status === 'Paid'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-700">
                        Installment #{inst.installmentNumber}
                      </span>
                      <StatusBadge status={inst.status} type="invoice" />
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                      {formatPKR(inst.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Due: <span className="font-mono">{inst.dueDate}</span>
                    </div>
                    {inst.paidDate && (
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Paid on {inst.paidDate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Receipts History */}
          {invoicePayments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 text-xs mb-2">
                Payment Receipts (PKR)
              </h4>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Channel</th>
                      <th className="p-2">Reference</th>
                      <th className="p-2">Received By</th>
                      <th className="p-2 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoicePayments.map((pay) => (
                      <tr key={pay.id}>
                        <td className="p-2 font-mono">{pay.date}</td>
                        <td className="p-2">{pay.paymentMethod}</td>
                        <td className="p-2 font-mono text-[11px] text-slate-600">
                          {pay.reference || '—'}
                        </td>
                        <td className="p-2 font-medium">{pay.receivedBy}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatPKR(pay.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoice Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-slate-500 text-[11px] space-y-1">
            <p className="font-medium text-slate-700">Thank you for visiting {clinicProfile.name}.</p>
            <p className="text-[10px] text-slate-400">
              Payments accepted via Cash, JazzCash, EasyPaisa, or Bank Transfer. Helpline: {clinicProfile.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
