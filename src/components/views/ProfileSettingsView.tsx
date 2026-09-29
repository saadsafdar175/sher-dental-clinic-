import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Building2, Users, ShieldCheck, Check, RotateCcw, UserCheck } from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const { clinicProfile, updateClinicProfile, users, clearAllRecords } = useClinic();

  const [name, setName] = useState(clinicProfile.name);
  const [tagline, setTagline] = useState(clinicProfile.tagline);
  const [phone, setPhone] = useState(clinicProfile.phone);
  const [email, setEmail] = useState(clinicProfile.email);
  const [address, setAddress] = useState(clinicProfile.address);
  const [taxNumber, setTaxNumber] = useState(clinicProfile.taxNumber || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicProfile({
      ...clinicProfile,
      name,
      tagline,
      phone,
      email,
      address,
      taxNumber,
      currencySymbol: 'PKR',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const permissionsMatrix = [
    { module: 'Dashboard & Clinic Overview', owner: 'Full (PKR)', dentists: 'Clinical & Schedule', trainees: 'Front Desk & Support' },
    { module: 'Patient Dental Case Files', owner: 'Full (CRUD)', dentists: 'Full (Dental Charting)', trainees: 'Registration & Intake' },
    { module: 'Appointment Booking & Queue', owner: 'Full', dentists: 'Full', trainees: 'Schedule & Check In' },
    { module: 'Itemized Invoices (PKR)', owner: 'Full (Issue & Void)', dentists: 'Create for Treated Patients', trainees: 'View & Create' },
    { module: 'Payment Receipts (PKR)', owner: 'Full Control', dentists: 'View Payment Status', trainees: 'Collect Cash / Online' },
    { module: 'Financial & P&L Reports (PKR)', owner: 'Full Access', dentists: 'Restricted', trainees: 'Restricted' },
    { module: 'Operating Expenses Ledger (PKR)', owner: 'Full Access', dentists: 'Restricted', trainees: 'Record Supplies / Bills' },
    { module: 'Dental Supplies & Restock', owner: 'Full', dentists: 'Inspect & Request', trainees: 'Receive Shipments' },
    { module: 'System Audit Trail', owner: 'Full Access', dentists: 'Restricted', trainees: 'Restricted' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Clinic Profile & Team Administration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Clinic branding, practice location, authorized clinical team, and PKR currency configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Practice Identity Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>Practice Details & Invoice Header</span>
              </h2>
              <p className="text-xs text-slate-500">
                Printed on itemized PKR receipts and patient case files
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Changes saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Clinic Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Clinic NTN / Reg #</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Practice Currency</label>
                <input
                  type="text"
                  disabled
                  value="Pakistani Rupee (PKR)"
                  className="w-full px-3 py-2 rounded-lg border border-teal-200 bg-teal-50/50 text-teal-900 font-mono font-bold text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Real Clinic Team (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span>Sher Dental Clinic Team</span>
              </h2>
              <p className="text-xs text-slate-500">Authorized clinic practitioners and workers</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {u.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.phone}</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'dentist'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {u.role === 'admin' ? 'Owner' : u.role === 'dentist' ? 'BDS' : 'Trainee'}
                </span>
              </div>
            ))}
          </div>

          {/* Reset / Clean data action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Reset records to pristine state?</span>
            <button
              onClick={() => {
                if (window.confirm('Clear all patient and financial records? The clinic team settings will be kept.')) {
                  clearAllRecords();
                }
              }}
              className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Records</span>
            </button>
          </div>
        </div>

        {/* Role Permissions Matrix (12 cols) */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Sher Dental Clinic Staff Roles & Access Responsibilities
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-4">Clinic Operational Area</th>
                  <th className="py-2.5 px-4 text-purple-900">Dr. Sher Muhammad (Owner)</th>
                  <th className="py-2.5 px-4 text-teal-900">Dr. Zeeshan & Dr. Rahmatullah (BDS)</th>
                  <th className="py-2.5 px-4 text-amber-900">M. Zuhaib & Imdadullah (Trainees)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((row) => (
                  <tr key={row.module} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{row.module}</td>
                    <td className="py-2.5 px-4 text-purple-700 font-medium">{row.owner}</td>
                    <td className="py-2.5 px-4 text-teal-700 font-medium">{row.dentists}</td>
                    <td className="py-2.5 px-4 text-amber-700 font-medium">{row.trainees}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
