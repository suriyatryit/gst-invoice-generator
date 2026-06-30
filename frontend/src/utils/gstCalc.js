/**
 * Computes all GST calculations for the invoice.
 * Automatically determines if it is an Intra-state supply (CGST + SGST) 
 * or an Inter-state supply (IGST) by comparing seller and buyer state codes.
 * 
 * @param {string} sellerStateCode 
 * @param {string} buyerStateCode 
 * @param {Array} items 
 * @returns {object} Calculated totals and breakdowns
 */
export function calculateInvoiceTotals(sellerStateCode, buyerStateCode, items = []) {
  // If states are different, it is Inter-state (IGST applies)
  // If states are same (or not yet fully set), it is Intra-state (CGST + SGST applies)
  const isInterState = !!(sellerStateCode && buyerStateCode && sellerStateCode !== buyerStateCode);

  let totalTaxableValue = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalTaxAmount = 0;
  let grandTotal = 0;

  // Group tax by GST rate slabs (e.g. 5%, 12%, 18%, 28%)
  const slabSummaries = {};

  const processedItems = items.map((item, index) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const gstRate = parseFloat(item.gstRate) || 0;

    const taxableValue = qty * rate;
    const taxAmount = taxableValue * (gstRate / 100);
    const total = taxableValue + taxAmount;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = taxAmount;
    } else {
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
    }

    // Accumulate global totals
    totalTaxableValue += taxableValue;
    totalCGST += cgst;
    totalSGST += sgst;
    totalIGST += igst;
    totalTaxAmount += taxAmount;
    grandTotal += total;

    // Accumulate slab summary
    const slabKey = gstRate.toFixed(1); // avoid float key discrepancies
    if (!slabSummaries[slabKey]) {
      slabSummaries[slabKey] = {
        gstRate,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        taxAmount: 0
      };
    }
    slabSummaries[slabKey].taxableValue += taxableValue;
    slabSummaries[slabKey].cgst += cgst;
    slabSummaries[slabKey].sgst += sgst;
    slabSummaries[slabKey].igst += igst;
    slabSummaries[slabKey].taxAmount += taxAmount;

    return {
      ...item,
      id: item.id || index.toString(),
      qty,
      rate,
      gstRate,
      taxableValue,
      taxAmount,
      cgst,
      sgst,
      igst,
      total
    };
  });

  return {
    isInterState,
    items: processedItems,
    totalTaxableValue,
    totalCGST,
    totalSGST,
    totalIGST,
    totalTaxAmount,
    grandTotal,
    slabSummaries: Object.values(slabSummaries).sort((a, b) => a.gstRate - b.gstRate)
  };
}

/**
 * Format helper for Indian Rupee Currency representation
 * @param {number} value 
 * @returns {string} Formatted string
 */
export function formatCurrency(value) {
  if (isNaN(value)) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);
}
