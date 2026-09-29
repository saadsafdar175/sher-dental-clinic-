import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { InventoryItem } from '../../types';
import { X, Package, Check, AlertCircle } from 'lucide-react';

interface NewInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInventoryItemModal: React.FC<NewInventoryItemModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addInventoryItem } = useClinic();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Restorative & Composite');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('boxes');
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(1500); // PKR
  const [supplier, setSupplier] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories: InventoryItem['category'][] = [
    'PPE & Sanitation',
    'Restorative & Composite',
    'Endodontic',
    'Anesthetics & Pharma',
    'Surgical & Burs',
    'Impression & Lab',
    'General',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!sku.trim()) {
      setError('Item SKU / Code is required');
      return;
    }

    addInventoryItem({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      quantity: Number(quantity) || 0,
      unit: unit.trim() || 'units',
      minStockLevel: Number(minStockLevel) || 1,
      unitCost: Number(unitCost) || 0,
      supplier: supplier.trim() || 'Standard Medical Supplier',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-700" />
              <span>Add New Dental Supply Item</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a stock tracking SKU with reorder threshold and PKR unit cost
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
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Supply Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lidocaine 2% Cartridges, Nitrile Gloves"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                SKU / Material Code *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SDC-LIDO-01"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs uppercase focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Unit (e.g. boxes)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="boxes, packets, tubes"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                min="1"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Unit Cost (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Med Supply Co."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              <span>Add Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
