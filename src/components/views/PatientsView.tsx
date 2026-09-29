import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import {
  Users,
  Search,
  Plus,
  Download,
  AlertTriangle,
  Calendar,
  Edit2,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

interface PatientsViewProps {
  onOpenNewPatient: () => void;
  onSelectPatient: (patientId: string) => void;
  onEditPatient: (patient: Patient) => void;
  onBookAppointmentForPatient: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onOpenNewPatient,
  onSelectPatient,
  onEditPatient,
  onBookAppointmentForPatient,
}) => {
  const { patients, invoices, appointments, exportCsv, formatPKR } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'balance' | 'zero'>('all');

  // Compute patient financial balances and upcoming visits
  const patientStats = useMemo(() => {
    const stats: Record<string, { totalBilled: number; totalPaid: number; balance: number; nextAptDate?: string }> = {};

    patients.forEach((p) => {
      const pInvoices = invoices.filter((inv) => inv.patientId === p.id);
      const totalBilled = pInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const totalPaid = pInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
      const balance = pInvoices.reduce((sum, i) => sum + i.remainingBalance, 0);

      const todayStr = '2026-09-29';
      const upcoming = appointments
        .filter((a) => a.patientId === p.id && a.date >= todayStr && a.status !== 'Cancelled')
        .sort((a, b) => a.date.localeCompare(b.date))[0];

      stats[p.id] = {
        totalBilled,
        totalPaid,
        balance,
        nextAptDate: upcoming ? `${upcoming.date} (${upcoming.time})` : undefined,
      };
    });

    return stats;
  }, [patients, invoices, appointments]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.allergies && p.allergies.some((a) => a.toLowerCase().includes(q)));

      const balance = patientStats[p.id]?.balance || 0;
      let matchesFilter = true;
      if (balanceFilter === 'balance') matchesFilter = balance > 0;
      if (balanceFilter === 'zero') matchesFilter = balance === 0;

      return matchesSearch && matchesFilter;
    });
  }, [patients, searchQuery, balanceFilter, patientStats]);

  const handleExportCsv = () => {
    const headers = [
      'Patient ID',
      'Full Name',
      'Gender',
      'Age/DOB',
      'Phone Number',
      'Address',
      'Blood Group',
      'Allergies',
      'Total Billed (PKR)',
      'Total Paid (PKR)',
      'Balance Due (PKR)',
      'Registration Date',
    ];

    const rows = filteredPatients.map((p) => {
      const st = patientStats[p.id] || { totalBilled: 0, totalPaid: 0, balance: 0 };
      return [
        p.patientId,
        p.name,
        p.gender,
        p.age ? `${p.age} yrs` : p.dob || '—',
        p.phone,
        p.address || '—',
        p.bloodGroup || '—',
        p.allergies ? p.allergies.join('; ') : 'None',
        st.totalBilled.toFixed(2),
        st.totalPaid.toFixed(2),
        st.balance.toFixed(2),
        p.createdAt,
      ];
    });

    exportCsv('Sher_Dental_Clinic_Patients', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Patient Medical Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dental case sheets, contact details, medical alerts, and accounts ({patients.length} registered)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {patients.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              title="Download patient records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onOpenNewPatient}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>
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
            placeholder="Search by patient name, phone, MR/ID, or allergy..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setBalanceFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              balanceFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setBalanceFilter('balance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              balanceFilter === 'balance'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            With Balance
          </button>
          <button
            onClick={() => setBalanceFilter('zero')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              balanceFilter === 'zero'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zero Balance
          </button>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-3">Contact & Phone</th>
                <th className="py-3 px-3">Medical / Allergy Alerts</th>
                <th className="py-3 px-3">Upcoming Visit</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <UserPlus className="w-8 h-8 text-teal-600 mx-auto opacity-70" />
                      <p className="font-semibold text-slate-700 text-sm">
                        {patients.length === 0 ? 'No patients registered yet' : 'No patients matching your search'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {patients.length === 0
                          ? 'Register your first patient file to begin scheduling visits and issuing PKR invoices.'
                          : 'Try modifying your search term or balance filter.'}
                      </p>
                      {patients.length === 0 && (
                        <button
                          onClick={onOpenNewPatient}
                          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register First Patient</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const stats = patientStats[patient.id] || { totalBilled: 0, totalPaid: 0, balance: 0 };
                  const hasAllergies = patient.allergies && patient.allergies.length > 0;

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(patient.id)}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {patient.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                              <span>{patient.patientId}</span>
                              <span aria-hidden="true">·</span>
                              <span>{patient.gender}</span>
                              {patient.age && <span>({patient.age} yrs)</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Address */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-800 font-medium">{patient.phone}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {patient.address || '—'}
                        </div>
                      </td>

                      {/* Allergies / Medical */}
                      <td className="py-3.5 px-3">
                        {hasAllergies ? (
                          <div className="inline-flex items-center gap-1 text-rose-800 font-medium text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{patient.allergies.join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No alerts</span>
                        )}
                      </td>

                      {/* Next Appointment */}
                      <td className="py-3.5 px-3">
                        {stats.nextAptDate ? (
                          <span className="font-mono text-slate-700 font-medium">
                            {stats.nextAptDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None scheduled</span>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums text-xs ${
                            stats.balance > 0 ? 'text-rose-700' : 'text-slate-700'
                          }`}
                        >
                          {formatPKR(stats.balance)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onBookAppointmentForPatient(patient)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded"
                          title="Schedule appointment"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          title="Edit patient details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded"
                          title="View clinical chart & billing"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
