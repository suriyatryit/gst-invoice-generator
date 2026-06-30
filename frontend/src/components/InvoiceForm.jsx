import React, { useMemo } from 'react';
import { Building2, User, FileText, Calendar, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import ItemTable from './ItemTable';
import { STATES_LIST } from '../data/gstSlabs.js';
import { validateGSTIN } from '../utils/gstinValidator.js';

export default function InvoiceForm({
  invoice,
  updateSeller,
  updateBuyer,
  updateDetails,
  addItem,
  removeItem,
  updateItem
}) {
  const { seller, buyer, details, items } = invoice;

  // Compute inline validation for Seller GSTIN
  const sellerGstinValidation = useMemo(() => {
    if (!seller.gstin) return null;
    return validateGSTIN(seller.gstin);
  }, [seller.gstin]);

  // Compute inline validation for Buyer GSTIN
  const buyerGstinValidation = useMemo(() => {
    if (!buyer.gstin) return null;
    return validateGSTIN(buyer.gstin);
  }, [buyer.gstin]);

  return (
    <div className="space-y-6">
      {/* 1. Seller Information */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-200">Seller Details (Your Business)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Business Name</label>
            <input
              type="text"
              value={seller.name}
              onChange={(e) => updateSeller('name', e.target.value)}
              placeholder="e.g. Suriya Enterprises"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">GSTIN</label>
            <div className="relative">
              <input
                type="text"
                value={seller.gstin}
                onChange={(e) => updateSeller('gstin', e.target.value)}
                placeholder="e.g. 33ABCDE1234F1Z5"
                className={`w-full px-3.5 py-2 pr-8 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                  sellerGstinValidation === null
                    ? 'border-slate-800 focus:border-indigo-500'
                    : sellerGstinValidation.isValid
                    ? 'border-emerald-700/80 focus:border-emerald-500'
                    : 'border-rose-800/80 focus:border-rose-500'
                }`}
              />
              <div className="absolute right-3 top-2.5">
                {sellerGstinValidation && (
                  sellerGstinValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )
                )}
              </div>
            </div>
            {sellerGstinValidation && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                sellerGstinValidation.isValid ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {sellerGstinValidation.isValid 
                  ? `✓ Valid — ${sellerGstinValidation.stateName}` 
                  : `✗ ${sellerGstinValidation.error}`}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">State Code (Calculated)</label>
            <select
              value={seller.stateCode}
              onChange={(e) => updateSeller('stateCode', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">Select State</option>
              {STATES_LIST.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} - {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-slate-400">Billing Address</label>
            <textarea
              rows="2"
              value={seller.address}
              onChange={(e) => updateSeller('address', e.target.value)}
              placeholder="Full physical address of seller..."
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Buyer Information */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-200">Buyer Details (Client)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Client Name</label>
            <input
              type="text"
              value={buyer.name}
              onChange={(e) => updateBuyer('name', e.target.value)}
              placeholder="e.g. ABC Technologies Pvt Ltd"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">GSTIN</label>
            <div className="relative">
              <input
                type="text"
                value={buyer.gstin}
                onChange={(e) => updateBuyer('gstin', e.target.value)}
                placeholder="e.g. 27XYZAB5678G1HZ"
                className={`w-full px-3.5 py-2 pr-8 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                  buyerGstinValidation === null
                    ? 'border-slate-800 focus:border-indigo-500'
                    : buyerGstinValidation.isValid
                    ? 'border-emerald-700/80 focus:border-emerald-500'
                    : 'border-rose-800/80 focus:border-rose-500'
                }`}
              />
              <div className="absolute right-3 top-2.5">
                {buyerGstinValidation && (
                  buyerGstinValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )
                )}
              </div>
            </div>
            {buyerGstinValidation && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                buyerGstinValidation.isValid ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {buyerGstinValidation.isValid 
                  ? `✓ Valid — ${buyerGstinValidation.stateName}` 
                  : `✗ ${buyerGstinValidation.error}`}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">State Code (Calculated)</label>
            <select
              value={buyer.stateCode}
              onChange={(e) => updateBuyer('stateCode', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">Select State</option>
              {STATES_LIST.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.code} - {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-slate-400">Billing Address</label>
            <textarea
              rows="2"
              value={buyer.address}
              onChange={(e) => updateBuyer('address', e.target.value)}
              placeholder="Full physical address of client..."
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Invoice Metadata */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-slate-200">Invoice Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              Invoice Number
            </label>
            <input
              type="text"
              value={details.invoiceNumber}
              onChange={(e) => updateDetails('invoiceNumber', e.target.value)}
              placeholder="e.g. INV-2026-001"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Invoice Date
            </label>
            <input
              type="date"
              value={details.invoiceDate}
              onChange={(e) => updateDetails('invoiceDate', e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Line Items Table */}
      <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm">
        <ItemTable
          items={items}
          onUpdateItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      </div>
    </div>
  );
}
