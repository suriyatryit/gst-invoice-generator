import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { GST_SLABS } from '../data/gstSlabs.js';
import { formatCurrency } from '../utils/gstCalc.js';

export default function ItemTable({ items, onUpdateItem, onAddItem, onRemoveItem }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400">Line Items</h3>
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg hover:bg-emerald-950/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[35%]">Description</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[15%]">HSN/SAC</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[10%] text-center">Qty</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[15%] text-right">Rate (₹)</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[12%] text-center">GST Slab</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[13%] text-right">Total (₹)</th>
              <th className="p-3 text-xs font-semibold uppercase tracking-wider text-slate-400 w-[5%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {items.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-sm text-slate-500">
                  No items added yet. Click "Add Item" to start building your invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const qty = item.qty === '' ? '' : item.qty;
                const rate = item.rate === '' ? '' : item.rate;
                const lineTotal = (parseFloat(qty) || 0) * (parseFloat(rate) || 0) * (1 + (item.gstRate / 100));

                return (
                  <tr key={item.id} className="group hover:bg-slate-900/20 transition-colors duration-150">
                    {/* Description */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="e.g. Consulting Services"
                        className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-800/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </td>

                    {/* HSN/SAC */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={item.hsnCode}
                        onChange={(e) => onUpdateItem(item.id, 'hsnCode', e.target.value)}
                        placeholder="e.g. 9983"
                        className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-800/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={qty}
                        onChange={(e) => onUpdateItem(item.id, 'qty', e.target.value)}
                        placeholder="1"
                        className="w-full px-2.5 py-1.5 text-sm text-center bg-slate-950 border border-slate-800/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Rate */}
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={rate}
                        onChange={(e) => onUpdateItem(item.id, 'rate', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 text-sm text-right bg-slate-950 border border-slate-800/80 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* GST Rate Dropdown */}
                    <td className="p-2.5">
                      <select
                        value={item.gstRate}
                        onChange={(e) => onUpdateItem(item.id, 'gstRate', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm text-center bg-slate-950 border border-slate-800/80 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        {GST_SLABS.map((slab) => (
                          <option key={slab} value={slab}>
                            {slab}%
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Line Total */}
                    <td className="p-2.5 text-right font-medium text-slate-300 text-sm">
                      {formatCurrency(lineTotal)}
                    </td>

                    {/* Remove Action */}
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}
