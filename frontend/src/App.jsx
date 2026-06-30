import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { RotateCcw, FileText, Sparkles, Save, History, Trash2 } from 'lucide-react';
import { useInvoice } from './hooks/useInvoice.js';
import { calculateInvoiceTotals, formatCurrency } from './utils/gstCalc.js';
import { exportToPDF } from './utils/pdfExport.js';
import InvoiceForm from './components/InvoiceForm.jsx';
import InvoicePreview from './components/InvoicePreview.jsx';
import GSTSummary from './components/GSTSummary.jsx';

const API_URL = 'http://localhost:5000/api/invoices';

export default function App() {
  const {
    invoice,
    updateSeller,
    updateBuyer,
    updateDetails,
    addItem,
    removeItem,
    updateItem,
    resetInvoice,
    loadInvoice
  } = useInvoice();

  // Local state for invoice database history
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Dynamically calculate invoice totals and taxes on every form state change
  const totals = useMemo(() => {
    return calculateInvoiceTotals(invoice.seller.stateCode, invoice.buyer.stateCode, invoice.items);
  }, [invoice.seller.stateCode, invoice.buyer.stateCode, invoice.items]);

  // Fetch all saved invoices from backend database
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to retrieve history');
      const data = await response.json();
      setHistoryList(data);
    } catch (err) {
      console.warn('Backend DB server connection failed:', err.message);
      setHistoryError('Database service offline (Verify if Express server and local MongoDB are running)');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Save invoice to database
  const handleSaveInvoice = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller: invoice.seller,
          buyer: invoice.buyer,
          details: invoice.details,
          items: invoice.items,
          totals
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      alert('Invoice successfully saved to history database!');
      fetchHistory(); // Refresh history panel
    } catch (err) {
      alert(`Error saving invoice: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete invoice from database
  const handleDeleteInvoice = async (id, e) => {
    e.stopPropagation(); // Avoid loading the deleted item
    if (!confirm('Are you sure you want to delete this invoice from history?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchHistory(); // Refresh history panel
    } catch (err) {
      alert(`Error deleting invoice: ${err.message}`);
    }
  };

  // PDF Export Trigger
  const handleExportPDF = () => {
    exportToPDF(invoice, totals);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* 1. Sleek Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                GST Invoice Generator
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" />
                  Premium
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Compliant with CGST, SGST & IGST regulations</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveInvoice}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Invoice'}
            </button>
            <button
              onClick={resetInvoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-850 hover:text-slate-200 transition-all cursor-pointer"
              title="Reset to default details"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Forms & Summary Cards (7 of 12 columns) */}
        <section className="lg:col-span-7 space-y-6">
          <InvoiceForm
            invoice={invoice}
            updateSeller={updateSeller}
            updateBuyer={updateBuyer}
            updateDetails={updateDetails}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
          />
          
          {/* Main GST Breakdown summary card displayed beneath form */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm">
            <GSTSummary totals={totals} />
          </div>

          {/* Database History Section */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-slate-200">Invoice History Database</h2>
            </div>
            
            {historyError ? (
              <p className="text-xs text-slate-500 italic">{historyError}</p>
            ) : isLoadingHistory ? (
              <p className="text-xs text-slate-400 animate-pulse">Retrieving invoices list...</p>
            ) : historyList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No saved invoices found. Use the "Save Invoice" button to store.</p>
            ) : (
              <div className="divide-y divide-slate-850 max-h-60 overflow-y-auto pr-1">
                {historyList.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => loadInvoice({
                      seller: item.seller,
                      buyer: item.buyer,
                      details: item.details,
                      items: item.items
                    })}
                    className="flex justify-between items-center py-2.5 px-2 hover:bg-slate-900/40 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-slate-200">{item.details.invoiceNumber} — {item.buyer.name}</p>
                      <p className="text-slate-500">Date: {item.details.invoiceDate} • Items: {item.items.length}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {formatCurrency(item.totals.grandTotal)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteInvoice(item._id, e)}
                        className="p-1 text-slate-600 hover:text-rose-400 rounded hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Live rendered invoice document sheet (5 of 12 columns) */}
        <section className="lg:col-span-5 lg:sticky lg:top-[85px] space-y-4">
          <InvoicePreview
            invoice={invoice}
            totals={totals}
            onExportPDF={handleExportPDF}
          />
        </section>
      </main>

      {/* Footer bar */}
      <footer className="py-4 border-t border-slate-900 text-center text-[10px] text-slate-600">
        © {new Date().getFullYear()} GST Invoice Builder. Generated invoices are fully client-side calculations.
      </footer>
    </div>
  );
}

