import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  TrendingUp,
  CreditCard,
  Package,
  History,
  Building2,
  X,
  UserCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'billing'
  | 'reports'
  | 'expenses'
  | 'inventory'
  | 'audit'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, appointments, inventory, invoices } = useClinic();

  const todayStr = '2026-09-29';
  const todayAptsCount = appointments.filter((a) => a.date === todayStr && a.status !== 'Cancelled').length;
  const lowStockCount = inventory.filter((i) => i.quantity <= i.minStockLevel).length;
  const overdueCount = invoices.filter((i) => i.status === 'Overdue' || (i.remainingBalance > 0 && i.dueDate < todayStr)).length;

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles: ('admin' | 'dentist' | 'trainee' | 'receptionist')[];
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['admin', 'dentist', 'trainee', 'receptionist'],
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      allowedRoles: ['admin', 'dentist', 'trainee', 'receptionist'],
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      badge: todayAptsCount > 0 ? todayAptsCount : undefined,
      badgeColor: 'text-teal-700 bg-teal-50',
      allowedRoles: ['admin', 'dentist', 'trainee', 'receptionist'],
    },
    {
      id: 'billing',
      label: 'Invoices & Billing',
      icon: Receipt,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'text-amber-700 bg-amber-50',
      allowedRoles: ['admin', 'dentist', 'trainee', 'receptionist'],
    },
    {
      id: 'reports',
      label: 'Financial Reports (PKR)',
      icon: TrendingUp,
      allowedRoles: ['admin'], // Owner / Admin access
    },
    {
      id: 'expenses',
      label: 'Expense Tracker',
      icon: CreditCard,
      allowedRoles: ['admin', 'trainee', 'receptionist'],
    },
    {
      id: 'inventory',
      label: 'Supplies & Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'text-rose-700 bg-rose-50',
      allowedRoles: ['admin', 'dentist', 'trainee', 'receptionist'],
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      allowedRoles: ['admin'],
    },
    {
      id: 'profile',
      label: 'Clinic Settings & Team',
      icon: Building2,
      allowedRoles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-base">
              S
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Sher Dental Clinic</div>
              <div className="text-[11px] text-teal-400 font-mono leading-none">Pakistan · PKR</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Clinical Operations
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600/20 text-white border border-teal-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User / Team Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-teal-800 border border-teal-600 shrink-0 flex items-center justify-center text-teal-100 font-bold text-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <UserCheck className="w-3 h-3 text-teal-400 shrink-0" />
                <span className="capitalize font-mono text-[10px] text-teal-300 truncate">
                  {currentUser.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
