import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem } from '../../types';
import { X, Package, Check, AlertCircle } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, item }) => {
  const { restockItem, formatPKR } = useClinic();

  const [quantityToAdd, setQuantityToAdd] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [recordAsExpense, setRecordAsExpense] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setQuantityToAdd(item.minStockLevel || 5);
      setUnitCost(item.unitCost || 0);
      setSupplier(item.supplier || 'Dental Supplier');
      setRecordAsExpense(true);
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const totalCost = (Number(quantityToAdd) || 0) * (Number(unitCost) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToAdd <= 0) {
      setError('Please specify quantity to add');
      return;
    }
    if (unitCost < 0) {
      setError('Unit cost cannot be negative');
      return;
    }

    restockItem(item.id, Number(quantityToAdd), Number(unitCost), supplier.trim(), recordAsExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-700" />
              <span>Restock Dental Supply</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Receive inventory shipment and update stock in PKR
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item details card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5">
          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
          <div className="text-slate-500 flex items-center gap-2">
            <span>SKU: <strong className="font-mono text-slate-700">{item.sku}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Category: {item.category}</span>
          </div>
          <div className="text-slate-600 flex items-center gap-3 pt-1">
            <span>
              Current Stock: <strong className="font-mono">{item.quantity} {item.unit}</strong>
            </span>
            <span>
              Min Re-order: <strong className="font-mono">{item.minStockLevel} {item.unit}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Quantity to Add ({item.unit}) *
              </label>
              <input
                type="number"
                min="1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Unit Cost (PKR) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-teal-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Distributor / Supplier *
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Lahore Dental Supply, Karachi Medical"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Total Purchase Cost:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums text-teal-800">
                {formatPKR(totalCost)}
              </span>
            </div>

            <label className="flex items-center gap-2 pt-2 border-t border-slate-200 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={recordAsExpense}
                onChange={(e) => setRecordAsExpense(e.target.checked)}
                className="rounded text-teal-700 focus:ring-teal-500"
              />
              <span>Automatically log {formatPKR(totalCost)} into Dental Supplies Expense ledger</span>
            </label>
          </div>

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
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Restock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
