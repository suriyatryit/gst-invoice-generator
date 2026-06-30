import React from 'react';
import { Download, FileSpreadsheet, Percent } from 'lucide-react';
import { STATE_CODES } from '../data/gstSlabs.js';
import { formatCurrency } from '../utils/gstCalc.js';

export default function InvoicePreview({ invoice, totals, onExportPDF }) {
  const { seller, buyer, details } = invoice;
  const {
    isInterState,
    items,
    totalTaxableValue,
    totalCGST,
    totalSGST,
    totalIGST,
    totalTaxAmount,
    grandTotal,
    slabSummaries
  } = totals;

  const sellerStateName = STATE_CODES[seller.stateCode] || 'Not Selected';
  const buyerStateName = STATE_CODES[buyer.stateCode] || 'Not Selected';

  return (
    <div className="space-y-4">
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 backdrop-blur-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Preview</span>
        <div className="flex gap-2">
          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 rounded-lg hover:bg-indigo-950/80 transition-all duration-200 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export as PDF
          </button>
        </div>
      </div>

      {/* Main Invoice Document Sheet */}
      <div id="invoice-document" className="bg-white text-slate-800 shadow-2xl rounded-2xl p-6 md:p-8 font-sans border border-slate-200 overflow-hidden select-none min-h-[842px]">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-5 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">{seller.name || 'Your Company Name'}</h1>
            <p className="text-xs text-slate-500 max-w-sm whitespace-pre-wrap">{seller.address || 'Company Address'}</p>
            {seller.gstin && (
              <p className="text-xs font-semibold text-slate-700">
                GSTIN: <span className="font-mono text-slate-900">{seller.gstin}</span>
              </p>
            )}
            <p className="text-xs text-slate-500">
              State: <span className="font-semibold text-slate-800">{sellerStateName}</span> (Code: {seller.stateCode || '--'})
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:space-y-1.5 self-stretch sm:self-auto flex flex-col justify-between">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider w-fit sm:ml-auto">
              Tax Invoice
            </span>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p>Invoice No: <span className="font-bold text-slate-900">{details.invoiceNumber || '---'}</span></p>
              <p>Date: <span className="font-medium text-slate-900">{details.invoiceDate || '---'}</span></p>
            </div>
          </div>
        </div>

        {/* Bill To Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
          <div>
            <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Billed To</h3>
            <p className="font-bold text-sm text-slate-900">{buyer.name || 'Client Name'}</p>
            <p className="text-slate-500 mt-1 whitespace-pre-wrap">{buyer.address || 'Client Address'}</p>
          </div>
          <div className="sm:text-right">
            <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5 sm:hidden">Details</h3>
            <div className="space-y-1 mt-1 sm:mt-5 text-slate-600">
              {buyer.gstin && (
                <p>
                  Buyer GSTIN: <span className="font-mono font-bold text-slate-900">{buyer.gstin}</span>
                </p>
              )}
              <p>
                Place of Supply: <span className="font-semibold text-slate-800">{buyerStateName}</span> (Code: {buyer.stateCode || '--'})
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 w-[5%]">#</th>
                <th className="py-2.5 w-[35%]">Item Description</th>
                <th className="py-2.5 w-[10%]">HSN</th>
                <th className="py-2.5 w-[10%] text-center">Qty</th>
                <th className="py-2.5 w-[12%] text-right">Rate</th>
                <th className="py-2.5 w-[13%] text-right">Taxable Amt</th>
                <th className="py-2.5 w-[15%] text-right">Tax Rate / Amt</th>
                <th className="py-2.5 w-[15%] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-slate-400">
                    No items in invoice.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const itemTax = isInterState 
                    ? `IGST ${item.gstRate}% (${formatCurrency(item.igst)})`
                    : `CGST ${item.gstRate/2}% (${formatCurrency(item.cgst)})\nSGST ${item.gstRate/2}% (${formatCurrency(item.sgst)})`;

                  return (
                    <tr key={item.id} className="align-top">
                      <td className="py-3 text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-3 font-semibold text-slate-900">
                        {item.description || 'Untitled Item'}
                      </td>
                      <td className="py-3 font-mono text-slate-500">{item.hsnCode || '---'}</td>
                      <td className="py-3 text-center">{item.qty}</td>
                      <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.taxableValue)}</td>
                      <td className="py-3 text-right text-[10px] leading-tight text-slate-500 whitespace-pre-line font-mono">
                        {itemTax}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t-2 border-slate-800 pt-5 text-xs text-slate-650">
          {/* Tax Slabs breakdown list */}
          <div className="space-y-3">
            {slabSummaries.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                <p className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">GST Summary Table</p>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {slabSummaries.map((slab) => (
                    <div key={slab.gstRate} className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Rate {slab.gstRate}% (Taxable: {formatCurrency(slab.taxableValue)})</span>
                      <span className="font-bold text-slate-800">
                        {isInterState 
                          ? `IGST: ${formatCurrency(slab.igst)}`
                          : `C+S: ${formatCurrency(slab.cgst * 2)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-[10px] text-slate-400 italic">
              * Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
            </div>
          </div>

          {/* Sum details card */}
          <div className="space-y-2.5 text-slate-700 ml-auto w-full max-w-xs md:text-right">
            <div className="flex justify-between md:justify-end md:gap-8">
              <span className="text-slate-500">Subtotal (Taxable):</span>
              <span className="font-semibold font-mono">{formatCurrency(totalTaxableValue)}</span>
            </div>

            {isInterState ? (
              <div className="flex justify-between md:justify-end md:gap-8">
                <span className="text-slate-500">IGST (Integrated Tax):</span>
                <span className="font-semibold font-mono">{formatCurrency(totalIGST)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between md:justify-end md:gap-8">
                  <span className="text-slate-500">CGST (Central Tax):</span>
                  <span className="font-semibold font-mono">{formatCurrency(totalCGST)}</span>
                </div>
                <div className="flex justify-between md:justify-end md:gap-8">
                  <span className="text-slate-500">SGST (State Tax):</span>
                  <span className="font-semibold font-mono">{formatCurrency(totalSGST)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between md:justify-end md:gap-8 border-t border-slate-100 pt-2">
              <span className="text-slate-500">Total Tax:</span>
              <span className="font-semibold font-mono">{formatCurrency(totalTaxAmount)}</span>
            </div>

            <div className="flex justify-between md:justify-end md:gap-8 border-t-2 border-slate-800 pt-2 text-sm">
              <span className="font-bold text-slate-900">Grand Total:</span>
              <span className="font-extrabold text-indigo-700 font-mono text-base">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Signature Area */}
            <div className="pt-8 text-center md:text-right space-y-1">
              <div className="text-[10px] text-slate-400 italic">For {seller.name || 'Your Company'}</div>
              <div className="h-10"></div> {/* Sign line space */}
              <div className="border-t border-slate-200 pt-1.5 text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
