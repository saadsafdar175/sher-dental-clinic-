import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../common/Badge';
import { History, Search, Download, ShieldCheck, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, exportCsv } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q);

      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [auditLogs, searchQuery, entityFilter]);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Staff Member', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityId,
      l.details,
    ]);
    exportCsv('Sher_Dental_Practice_Audit_Trail', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <span>Practice Security & Financial Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all billing adjustments, payment receipts, appointment bookings, and staff actions
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action, or keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
          >
            <option value="all">All Entity Types</option>
            <option value="Invoice">Invoice</option>
            <option value="Payment">Payment</option>
            <option value="Appointment">Appointment</option>
            <option value="Patient">Patient</option>
            <option value="Expense">Expense</option>
            <option value="Inventory">Inventory</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor / Staff</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No audit logs match criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={log.userRole} type="role" />
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {log.entityType} ({log.entityId.slice(0, 10)})
                    </td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
