import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  HeartPulse,
  Calendar,
  Receipt,
  Plus,
  Edit2,
} from 'lucide-react';

interface PatientDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onEditPatient: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
  onCreateInvoice: (patient: Patient) => void;
  onRecordPayment: (invoiceId: string) => void;
  onViewInvoice: (invoiceId: string) => void;
}

export const PatientDrawer: React.FC<PatientDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onEditPatient,
  onBookAppointment,
  onCreateInvoice,
  onRecordPayment,
  onViewInvoice,
}) => {
  const { appointments, invoices, updatePatient, formatPKR } = useClinic();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'appointments' | 'billing'>('overview');
  const [newDentalNote, setNewDentalNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!isOpen || !patient) return null;

  const patientAppointments = appointments
    .filter((a) => a.patientId === patient.id)
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const patientInvoices = invoices
    .filter((inv) => inv.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalBilled = patientInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaid = patientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = patientInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

  const handleAppendDentalNote = () => {
    if (!newDentalNote.trim()) return;
    const timestamp = '2026-09-29';
    const updatedNotes = patient.dentalNotes
      ? `${patient.dentalNotes}\n\n[${timestamp}]: ${newDentalNote.trim()}`
      : `[${timestamp}]: ${newDentalNote.trim()}`;

    updatePatient(patient.id, { dentalNotes: updatedNotes });
    setNewDentalNote('');
    setIsAddingNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header Profile Bar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {patient.patientId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{patient.gender}</span>
                  {patient.age && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{patient.age} yrs</span>
                    </>
                  )}
                  {patient.bloodGroup && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-medium text-slate-700">Blood {patient.bloodGroup}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEditPatient(patient)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Edit Patient Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Medical Alerts */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">Medical Alert:</span> Allergy to{' '}
                <span className="font-semibold underline">
                  {patient.allergies.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Financial Summary in PKR */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Total Invoiced (PKR)</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                {formatPKR(totalBilled)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Paid (PKR)</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                {formatPKR(totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Balance Due (PKR)</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  totalOutstanding > 0 ? 'text-rose-700' : 'text-slate-700'
                }`}
              >
                {formatPKR(totalOutstanding)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Health
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dental Case Notes
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'appointments'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visits ({patientAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'billing'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Invoices & Ledger ({patientInvoices.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{patient.email || 'No email registered'}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{patient.address || 'No address registered'}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                  Emergency Contact
                </h4>
                {patient.emergencyContact && patient.emergencyContact.name ? (
                  <div className="text-slate-700 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Name</span>
                      <span className="font-medium">{patient.emergencyContact.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Relationship</span>
                      <span>{patient.emergencyContact.relationship || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Phone</span>
                      <span className="font-mono">{patient.emergencyContact.phone || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No emergency contact recorded.</p>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Medical History & Systemic Conditions
                </h4>
                {patient.medicalConditions && patient.medicalConditions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {patient.medicalConditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">No systemic medical conditions reported.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Clinical Dental Notes & Procedure Plans
                </h4>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Note</span>
                </button>
              </div>

              {isAddingNote && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <label className="block font-medium text-slate-700 text-xs">
                    New Clinical Entry (Dr. Sher Muhammad / Dr. Zeeshan / Dr. Rahmatullah)
                  </label>
                  <textarea
                    rows={3}
                    value={newDentalNote}
                    onChange={(e) => setNewDentalNote(e.target.value)}
                    placeholder="Tooth #, cavity evaluation, root canal canal lengths, prescription notes..."
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAppendDentalNote}
                      className="px-3 py-1 bg-teal-700 text-white rounded font-medium hover:bg-teal-800"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                {patient.dentalNotes || (
                  <span className="italic text-slate-400">No clinical notes recorded yet for this patient.</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Visit History
                </h4>
                <button
                  onClick={() => onBookAppointment(patient)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Schedule Visit</span>
                </button>
              </div>

              {patientAppointments.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-slate-500">
                  No appointments scheduled for this patient.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {patientAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{apt.type}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                            <span className="font-mono text-slate-700 font-medium">
                              {apt.date} at {apt.time}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{apt.durationMinutes} mins</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-teal-700 font-medium">{apt.dentistName}</span>
                            {apt.traineeName && (
                              <span className="text-slate-400">(Asst: {apt.traineeName})</span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={apt.status} type="appointment" />
                      </div>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-600 mt-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Invoices & Financial Ledger (PKR)
                </h4>
                <button
                  onClick={() => onCreateInvoice(patient)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Invoice</span>
                </button>
              </div>

              {patientInvoices.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg text-slate-500">
                  No invoices generated for this patient yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {inv.invoiceNumber}
                            </span>
                            {inv.isInstallmentPlan && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                                Installments
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                            <span>Date: {inv.date}</span>
                            <span aria-hidden="true">·</span>
                            <span>Due: {inv.dueDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{inv.items.length} procedure(s)</span>
                          </div>
                        </div>
                        <StatusBadge status={inv.status} type="invoice" />
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            Total: <strong className="font-mono text-slate-800">{formatPKR(inv.grandTotal)}</strong>
                          </span>
                          <span className="text-slate-500">
                            Paid: <strong className="font-mono text-emerald-700">{formatPKR(inv.amountPaid)}</strong>
                          </span>
                          <span className="text-slate-500">
                            Balance:{' '}
                            <strong
                              className={`font-mono ${
                                inv.remainingBalance > 0 ? 'text-rose-700' : 'text-slate-700'
                              }`}
                            >
                              {formatPKR(inv.remainingBalance)}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onViewInvoice(inv.id)}
                            className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
                          >
                            View
                          </button>
                          {inv.remainingBalance > 0 && (
                            <button
                              onClick={() => onRecordPayment(inv.id)}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium"
                            >
                              Collect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Registered on {patient.createdAt} · Sher Dental Clinic
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
