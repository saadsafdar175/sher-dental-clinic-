import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import { X, User, Phone, Mail, MapPin, AlertCircle, HeartPulse, Check } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSaved?: (patient: Patient) => void;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  onSaved,
}) => {
  const { addPatient, updatePatient } = useClinic();

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    age: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    allergies: '',
    medicalConditions: '',
    dentalNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        name: patientToEdit.name,
        gender: patientToEdit.gender,
        age: patientToEdit.age ? String(patientToEdit.age) : '',
        dob: patientToEdit.dob || '',
        phone: patientToEdit.phone,
        email: patientToEdit.email || '',
        address: patientToEdit.address || '',
        bloodGroup: patientToEdit.bloodGroup || '',
        emergencyName: patientToEdit.emergencyContact?.name || '',
        emergencyPhone: patientToEdit.emergencyContact?.phone || '',
        emergencyRelationship: patientToEdit.emergencyContact?.relationship || '',
        allergies: patientToEdit.allergies ? patientToEdit.allergies.join(', ') : '',
        medicalConditions: patientToEdit.medicalConditions ? patientToEdit.medicalConditions.join(', ') : '',
        dentalNotes: patientToEdit.dentalNotes || '',
      });
    } else {
      setFormData({
        name: '',
        gender: 'Male',
        age: '',
        dob: '',
        phone: '',
        email: '',
        address: '',
        bloodGroup: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelationship: '',
        allergies: '',
        medicalConditions: '',
        dentalNotes: '',
      });
    }
    setErrors({});
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Patient full name is required';
    if (!formData.phone.trim()) errs.phone = 'Contact phone number is required';
    if (formData.email && !formData.email.includes('@')) {
      errs.email = 'Valid email address format required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAllergies = formData.allergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedConditions = formData.medicalConditions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (patientToEdit) {
      updatePatient(patientToEdit.id, {
        name: formData.name.trim(),
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : undefined,
        dob: formData.dob || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: formData.emergencyName
          ? {
              name: formData.emergencyName.trim(),
              phone: formData.emergencyPhone.trim(),
              relationship: formData.emergencyRelationship.trim(),
            }
          : undefined,
        allergies: parsedAllergies,
        medicalConditions: parsedConditions,
        dentalNotes: formData.dentalNotes.trim() || undefined,
      });
      if (onSaved) {
        onSaved({
          ...patientToEdit,
          name: formData.name.trim(),
          gender: formData.gender,
          age: formData.age ? Number(formData.age) : undefined,
          dob: formData.dob,
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          bloodGroup: formData.bloodGroup,
          allergies: parsedAllergies,
          medicalConditions: parsedConditions,
          dentalNotes: formData.dentalNotes.trim(),
        });
      }
    } else {
      const created = addPatient({
        name: formData.name.trim(),
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : undefined,
        dob: formData.dob || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        emergencyContact: formData.emergencyName
          ? {
              name: formData.emergencyName.trim(),
              phone: formData.emergencyPhone.trim(),
              relationship: formData.emergencyRelationship.trim(),
            }
          : undefined,
        allergies: parsedAllergies,
        medicalConditions: parsedConditions,
        dentalNotes: formData.dentalNotes.trim() || undefined,
      });
      if (onSaved) onSaved(created);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {patientToEdit ? `Edit Patient File: ${patientToEdit.name}` : 'Register New Patient File'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sher Dental Clinic patient clinical record and emergency contacts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Personal Info Grid */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              Patient Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Muhammad Ali"
                  className={`w-full px-3 py-2 rounded-lg border text-xs focus:ring-2 focus:ring-teal-500 ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as 'Male' | 'Female' | 'Other',
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 35"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                >
                  <option value="">-- Select --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Phone Number (Mobile / WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1234567"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono focus:ring-2 focus:ring-teal-500 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Address / City Area
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House #, Street, Colony / City Area"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              Emergency / Guardian Contact (Optional)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="0300-0000000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Relation</label>
                <input
                  type="text"
                  value={formData.emergencyRelationship}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyRelationship: e.target.value })
                  }
                  placeholder="e.g. Father, Spouse, Brother"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Medical Alerts & Allergies */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-rose-800">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Allergies & Medical History (Clinical Alert)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Drug / Latex Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Augmentin, NSAIDs"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Medical Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalConditions: e.target.value })
                  }
                  placeholder="e.g. Diabetes, Hypertension, Hepatitis B/C, Asthma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  Clinical Dental Notes & Chief Complaint
                </label>
                <textarea
                  rows={2}
                  value={formData.dentalNotes}
                  onChange={(e) => setFormData({ ...formData, dentalNotes: e.target.value })}
                  placeholder="Chief dental complaint, tooth charting, history of pain, proposed procedures..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{patientToEdit ? 'Save Changes' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
