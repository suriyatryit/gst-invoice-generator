import React from 'react';
import { formatCurrency } from '../utils/gstCalc.js';

export default function GSTSummary({ totals }) {
  const {
    isInterState,
    totalTaxableValue,
    totalCGST,
    totalSGST,
    totalIGST,
    totalTaxAmount,
    grandTotal,
    slabSummaries
  } = totals;

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800/80">
      {/* Slab Breakdown Table */}
      {slabSummaries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">GST Slab Breakdown</h4>
          <div className="overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30">
                  <th className="p-2 font-medium text-slate-400">GST Rate</th>
                  <th className="p-2 font-medium text-slate-400 text-right">Taxable Amt (₹)</th>
                  {isInterState ? (
                    <th className="p-2 font-medium text-slate-400 text-right">IGST (₹)</th>
                  ) : (
                    <>
                      <th className="p-2 font-medium text-slate-400 text-right">CGST (₹)</th>
                      <th className="p-2 font-medium text-slate-400 text-right">SGST (₹)</th>
                    </>
                  )}
                  <th className="p-2 font-medium text-slate-400 text-right">Total Tax (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {slabSummaries.map((slab) => (
                  <tr key={slab.gstRate} className="hover:bg-slate-900/10">
                    <td className="p-2 text-slate-300 font-medium">{slab.gstRate}%</td>
                    <td className="p-2 text-right text-slate-400">{formatCurrency(slab.taxableValue)}</td>
                    {isInterState ? (
                      <td className="p-2 text-right text-slate-400">{formatCurrency(slab.igst)}</td>
                    ) : (
                      <>
                        <td className="p-2 text-right text-slate-400">{formatCurrency(slab.cgst)}</td>
                        <td className="p-2 text-right text-slate-400">{formatCurrency(slab.sgst)}</td>
                      </>
                    )}
                    <td className="p-2 text-right text-slate-300 font-medium">{formatCurrency(slab.taxAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Totals Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 border border-slate-800/80 rounded-xl p-4">
        <div className="text-xs text-slate-500 space-y-1">
          <p>
            Supply Type: <span className="font-semibold text-slate-300">{isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</span>
          </p>
          <p>Taxes are calculated based on seller and buyer state codes.</p>
        </div>

        <div className="w-full md:w-80 space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Taxable Value</span>
            <span className="font-medium text-slate-200">{formatCurrency(totalTaxableValue)}</span>
          </div>

          {isInterState ? (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">IGST (Integrated Tax)</span>
              <span className="font-medium text-slate-200">{formatCurrency(totalIGST)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">CGST (Central Tax)</span>
                <span className="font-medium text-slate-200">{formatCurrency(totalCGST)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">SGST (State Tax)</span>
                <span className="font-medium text-slate-200">{formatCurrency(totalSGST)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800">
            <span className="text-slate-400">Total Tax Amount</span>
            <span className="font-medium text-slate-200">{formatCurrency(totalTaxAmount)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t-2 border-slate-800">
            <span className="text-base font-semibold text-slate-200">Grand Total</span>
            <span className="text-lg font-bold text-indigo-400">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
