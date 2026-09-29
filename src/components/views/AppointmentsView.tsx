import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Edit,
  Receipt,
  UserCheck,
} from 'lucide-react';

interface AppointmentsViewProps {
  onOpenNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onSelectPatient: (patientId: string) => void;
  onCreateInvoiceForAppointment: (appointment: Appointment) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onOpenNewAppointment,
  onEditAppointment,
  onSelectPatient,
  onCreateInvoiceForAppointment,
}) => {
  const { appointments, updateAppointmentStatus, cancelAppointment, users } = useClinic();

  const [viewMode, setViewMode] = useState<'daily' | 'calendar'>('daily');
  const [selectedDate, setSelectedDate] = useState('2026-09-29'); // Today
  const [staffFilter, setStaffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September

  // Filtered appointments for daily list
  const dailyAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const matchesDate = a.date === selectedDate;
        const matchesStaff =
          staffFilter === 'all' ||
          a.dentistId === staffFilter ||
          a.traineeId === staffFilter;
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesDate && matchesStaff && matchesStatus;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, staffFilter, statusFilter]);

  // Calendar Days generator
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${currentYear}-${monthStr}-${dayStr}`;

      const dayAppointments = appointments.filter((a) => a.date === dateString);
      days.push({
        dayNumber: d,
        dateString,
        appointments: dayAppointments,
        isToday: dateString === '2026-09-29',
        isSelected: dateString === selectedDate,
      });
    }

    return days;
  }, [currentYear, currentMonth, appointments, selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCancel = (apt: Appointment) => {
    const reason = window.prompt(`Reason for cancelling appointment for ${apt.patientName}?`, 'Patient requested reschedule');
    if (reason !== null) {
      cancelAppointment(apt.id, reason);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Appointments & Operatory Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dental procedures scheduled for Dr. Sher Muhammad, Dr. Zeeshan, Dr. Rahmatullah, and trainees
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daily List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* DAILY LIST VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Date Picker & Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={() => setSelectedDate('2026-09-29')}
                className="px-2.5 py-1.5 text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 font-medium transition-colors"
              >
                Today
              </button>
            </div>

            {/* Filter by Staff and Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="all">All Doctors & Trainees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Checked In">Checked In</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">
                Schedule for {selectedDate} ({dailyAppointments.length} visits)
              </h2>
            </div>

            {dailyAppointments.length === 0 ? (
              <div className="py-14 px-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">No appointments scheduled for this date</p>
                <p className="text-[11px] text-slate-400">
                  Ready for booking. Select a patient and assign the attending dentist or trainee assistant.
                </p>
                <button
                  onClick={onOpenNewAppointment}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book Appointment Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-xl border transition-all ${
                      apt.status === 'Cancelled'
                        ? 'bg-slate-50/70 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Time & Details */}
                      <div className="flex items-start gap-3">
                        <div className="text-center w-16 bg-slate-50 p-2 rounded-lg border border-slate-200 shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-sm block">
                            {apt.time}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {apt.durationMinutes} mins
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onSelectPatient(apt.patientId)}
                              className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-sm"
                            >
                              {apt.patientName}
                            </button>
                            <span className="text-slate-400">·</span>
                            <span className="text-teal-800 font-medium text-xs">
                              {apt.dentistName}
                            </span>
                            {apt.traineeName && (
                              <>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600 text-xs">Asst: {apt.traineeName}</span>
                              </>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                            <span className="font-medium text-slate-800">{apt.type}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-500 font-mono">{apt.operatory}</span>
                          </div>

                          {apt.notes && (
                            <p className="text-[11px] text-slate-500 mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 max-w-xl">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Dropdown & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                          }
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-medium"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Checked In">Checked In</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <StatusBadge status={apt.status} type="appointment" />

                        {apt.status === 'Completed' && (
                          <button
                            onClick={() => onCreateInvoiceForAppointment(apt)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors flex items-center gap-1"
                            title="Generate invoice in PKR for this visit"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditAppointment(apt)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Reschedule / Edit details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCancel(apt)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Cancel appointment"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(8);
                  setSelectedDate('2026-09-29');
                }}
                className="px-2.5 py-1 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded font-medium"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[90px]" />;
              }

              const isSelected = day.dateString === selectedDate;

              return (
                <div
                  key={day.dateString}
                  onClick={() => {
                    setSelectedDate(day.dateString);
                    setViewMode('daily');
                  }}
                  className={`min-h-[90px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/60 ring-2 ring-teal-600 ring-inset'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                        day.isToday
                          ? 'bg-teal-700 text-white font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.appointments.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {day.appointments.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {day.appointments.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                          a.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : a.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-400 line-through'
                            : 'bg-teal-50 text-teal-800'
                        }`}
                      >
                        {a.time} {a.patientName.split(' ')[0]}
                      </div>
                    ))}
                    {day.appointments.length > 2 && (
                      <div className="text-[9px] text-slate-400 pl-1 font-medium">
                        +{day.appointments.length - 2} more
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 text-right">Click to view</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
