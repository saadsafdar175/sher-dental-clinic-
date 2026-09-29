import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  Package,
  Plus,
  Download,
  AlertTriangle,
  RotateCw,
  Search,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenRestockModal: (item: InventoryItem) => void;
  onOpenNewItemModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenRestockModal,
  onOpenNewItemModal,
}) => {
  const { inventory, stockPurchases, exportCsv, formatPKR } = useClinic();

  const [activeTab, setActiveTab] = useState<'stock' | 'purchases'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    'PPE & Sanitation',
    'Restorative & Composite',
    'Endodontic',
    'Anesthetics & Pharma',
    'Surgical & Burs',
    'Impression & Lab',
    'General',
  ];

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [inventory, searchQuery, categoryFilter]);

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minStockLevel);
  const totalValuation = inventory.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);

  const handleExportCsv = () => {
    const headers = ['SKU', 'Item Name', 'Category', 'Quantity', 'Unit', 'Min Stock Level', 'Unit Cost (PKR)', 'Supplier', 'Status', 'Last Restocked'];
    const rows = filteredInventory.map((i) => [
      i.sku,
      i.name,
      i.category,
      i.quantity,
      i.unit,
      i.minStockLevel,
      i.unitCost.toFixed(2),
      i.supplier,
      i.quantity <= i.minStockLevel ? 'LOW STOCK' : 'IN STOCK',
      i.lastRestocked || '—',
    ]);
    exportCsv('Sher_Dental_Clinic_Inventory_PKR', headers, rows);
  };

  const handleExportPurchasesCsv = () => {
    const headers = ['Date', 'Item Name', 'Quantity Added', 'Unit Cost (PKR)', 'Total Cost (PKR)', 'Supplier', 'Recorded By'];
    const rows = stockPurchases.map((p) => [
      p.date,
      p.itemName,
      p.quantityAdded,
      p.unitCost.toFixed(2),
      p.totalCost.toFixed(2),
      p.supplier,
      p.recordedBy,
    ]);
    exportCsv('Sher_Dental_Clinic_Stock_Purchases_PKR', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dental Supplies & Inventory (PKR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor clinic materials, re-order levels, supplier orders, and procurement costs in PKR
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inventory.length > 0 && (
            <button
              onClick={activeTab === 'stock' ? handleExportCsv : handleExportPurchasesCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
          <button
            onClick={onOpenNewItemModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supply Item</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Active Supplies Tracked</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {inventory.length}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Catalog items</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Low Stock Alerts</span>
          <span
            className={`text-2xl font-bold font-mono tabular-nums ${
              lowStockItems.length > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {lowStockItems.length} items
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {lowStockItems.length > 0 ? 'Requires restocking' : 'All items at healthy stock level'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-slate-500 text-xs block">Total Inventory Value (PKR)</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {formatPKR(totalValuation)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Based on unit purchase cost</span>
        </div>
      </div>

      {/* Low-Stock Alert Warning Card */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Low-Stock Warning: {lowStockItems.length} supplies at or below minimum threshold</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-white rounded-lg border border-rose-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 truncate max-w-[170px]">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-rose-700 font-mono">
                    Stock: {item.quantity} / Min: {item.minStockLevel} {item.unit}
                  </div>
                </div>
                <button
                  onClick={() => onOpenRestockModal(item)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="flex items-center justify-between px-6 border-b border-slate-200 bg-slate-50/50 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeTab === 'stock'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Supplies & Material Stock ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`py-3 px-3.5 font-semibold border-b-2 transition-colors ${
                activeTab === 'purchases'
                  ? 'border-teal-700 text-teal-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Purchase & Reorder History ({stockPurchases.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Current Stock */}
        {activeTab === 'stock' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search supplies by name, SKU, or supplier..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">SKU & Item Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Current Stock</th>
                    <th className="py-2.5 px-3 text-center">Min Level</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost (PKR)</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center text-slate-500">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Package className="w-8 h-8 text-teal-600 mx-auto opacity-70" />
                          <p className="font-semibold text-slate-700 text-sm">
                            {inventory.length === 0 ? 'No supplies in inventory yet' : 'No items match your filter'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {inventory.length === 0
                              ? 'Register your clinic materials (anesthetics, gloves, composites, burs) with unit costs in PKR.'
                              : 'Try modifying your search query.'}
                          </p>
                          {inventory.length === 0 && (
                            <button
                              onClick={onOpenNewItemModal}
                              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add First Supply Item</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isLow = item.quantity <= item.minStockLevel;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isLow ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="font-mono text-[11px] text-slate-400">{item.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{item.category}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                            <span className={isLow ? 'text-rose-700' : 'text-slate-900'}>
                              {item.quantity}
                            </span>{' '}
                            <span className="text-[10px] text-slate-400 font-sans font-normal">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500 text-xs">
                            {item.minStockLevel} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                            {formatPKR(item.unitCost)}
                          </td>
                          <td className="py-3 px-3 text-slate-700">{item.supplier}</td>
                          <td className="py-3 px-3 text-center">
                            <StatusBadge status={isLow ? 'Low Stock' : 'In Stock'} type="stock" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onOpenRestockModal(item)}
                              className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors flex items-center gap-1 ml-auto"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>Restock</span>
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
        )}

        {/* Tab 2: Purchases History */}
        {activeTab === 'purchases' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Supply Item</th>
                    <th className="py-2.5 px-3 text-center">Qty Received</th>
                    <th className="py-2.5 px-3 text-right">Unit Price (PKR)</th>
                    <th className="py-2.5 px-3 text-right">Total Cost (PKR)</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No purchase or restock orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    stockPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          {p.date}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.itemName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          +{p.quantityAdded}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {formatPKR(p.unitCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {formatPKR(p.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{p.supplier}</td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.recordedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
