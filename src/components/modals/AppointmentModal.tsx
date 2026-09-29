import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, Patient } from '../../types';
import { X, Calendar, Clock, User, Stethoscope, Check, AlertCircle } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: Appointment | null;
  preselectedPatient?: Patient | null;
  preselectedDate?: string;
  onOpenNewPatient?: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointmentToEdit,
  preselectedPatient,
  preselectedDate,
  onOpenNewPatient,
}) => {
  const { patients, users, treatments, addAppointment, updateAppointment } = useClinic();

  const dentists = users.filter((u) => u.role === 'dentist' || u.role === 'admin');
  const trainees = users.filter((u) => u.role === 'trainee');

  const [patientId, setPatientId] = useState('');
  const [dentistId, setDentistId] = useState('');
  const [traineeId, setTraineeId] = useState('');
  const [date, setDate] = useState('2026-09-29');
  const [time, setTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [type, setType] = useState('Dental Consultation & Oral Examination');
  const [operatory, setOperatory] = useState('Operatory Dental Chair 1');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Appointment['status']>('Scheduled');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointmentToEdit) {
      setPatientId(appointmentToEdit.patientId);
      setDentistId(appointmentToEdit.dentistId);
      setTraineeId(appointmentToEdit.traineeId || '');
      setDate(appointmentToEdit.date);
      setTime(appointmentToEdit.time);
      setDurationMinutes(appointmentToEdit.durationMinutes);
      setType(appointmentToEdit.type);
      setOperatory(appointmentToEdit.operatory);
      setNotes(appointmentToEdit.notes || '');
      setStatus(appointmentToEdit.status);
    } else {
      setPatientId(preselectedPatient ? preselectedPatient.id : (patients[0]?.id || ''));
      setDentistId(dentists[0]?.id || users[0]?.id || '');
      setTraineeId('');
      setDate(preselectedDate || '2026-09-29');
      setTime('10:00');
      setDurationMinutes(30);
      setType('Dental Consultation & Oral Examination');
      setOperatory('Operatory Dental Chair 1');
      setNotes('');
      setStatus('Scheduled');
    }
    setErrors({});
  }, [appointmentToEdit, preselectedPatient, preselectedDate, patients, dentists, users, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!patientId) errs.patientId = 'Please select a patient';
    if (!dentistId) errs.dentistId = 'Please assign a practitioner';
    if (!date) errs.date = 'Date is required';
    if (!time) errs.time = 'Time is required';
    if (!type.trim()) errs.type = 'Procedure / visit reason is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const patient = patients.find((p) => p.id === patientId);
    const assignedStaff = users.find((u) => u.id === dentistId);
    const assignedTrainee = users.find((u) => u.id === traineeId);

    if (!patient || !assignedStaff) return;

    if (appointmentToEdit) {
      updateAppointment(appointmentToEdit.id, {
        patientId: patient.id,
        patientName: patient.name,
        dentistId: assignedStaff.id,
        dentistName: assignedStaff.name,
        traineeId: assignedTrainee ? assignedTrainee.id : undefined,
        traineeName: assignedTrainee ? assignedTrainee.name : undefined,
        date,
        time,
        durationMinutes: Number(durationMinutes),
        type,
        operatory,
        status,
        notes: notes.trim(),
      });
    } else {
      addAppointment({
        patientId: patient.id,
        patientName: patient.name,
        dentistId: assignedStaff.id,
        dentistName: assignedStaff.name,
        traineeId: assignedTrainee ? assignedTrainee.id : undefined,
        traineeName: assignedTrainee ? assignedTrainee.name : undefined,
        date,
        time,
        durationMinutes: Number(durationMinutes),
        type,
        operatory,
        status: 'Scheduled',
        notes: notes.trim(),
      });
    }

    onClose();
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {appointmentToEdit ? 'Reschedule / Update Appointment' : 'Schedule Dental Appointment'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign doctor, assisting trainee worker, operatory chair, and procedure
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
          {/* Patient Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-slate-700">Patient *</label>
              {onOpenNewPatient && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewPatient();
                  }}
                  className="text-teal-700 hover:underline text-[11px] font-medium"
                >
                  + New Patient
                </button>
              )}
            </div>
            {patients.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                No patients registered yet. Please register a patient before booking an appointment.
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

          {/* Attending Doctor & Trainee Worker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <option value="">None / Solo</option>
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Trainee)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 font-mono"
              />
              {errors.date && <p className="text-[11px] text-rose-600 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Time Slot *
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 font-mono"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
                <option value={90}>90 mins</option>
              </select>
            </div>
          </div>

          {/* Procedure Type & Operatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Dental Procedure / Reason *
              </label>
              <input
                type="text"
                list="treatment-options"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Select or enter procedure"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
              />
              <datalist id="treatment-options">
                {treatments.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
                <option value="Toothache Emergency" />
                <option value="Suture Removal" />
                <option value="Crown Seating" />
                <option value="Clear Aligners Check" />
              </datalist>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Operatory / Chair
              </label>
              <select
                value={operatory}
                onChange={(e) => setOperatory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="Operatory Dental Chair 1">Operatory Dental Chair 1</option>
                <option value="Operatory Dental Chair 2">Operatory Dental Chair 2</option>
                <option value="Consultation & Diagnostic Suite">Consultation & Diagnostic Suite</option>
              </select>
            </div>
          </div>

          {/* Status (if editing) */}
          {appointmentToEdit && (
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Appointment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Appointment['status'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Checked In">Checked In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Clinical Instructions / Symptoms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Severe throbbing pain in upper left quadrant. Check vitality on #26."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Actions */}
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
              <span>{appointmentToEdit ? 'Save Changes' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
