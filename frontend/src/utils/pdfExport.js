import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { STATE_CODES } from '../data/gstSlabs.js';
import { formatCurrency } from './gstCalc.js';

/**
 * Generates and downloads a clean, professional, GST-compliant A4 PDF
 * using jsPDF and jspdf-autotable.
 * 
 * @param {object} invoice 
 * @param {object} totals 
 */
export function exportToPDF(invoice, totals) {
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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Document base setup
  doc.setFont('helvetica', 'normal');

  // 1. Seller Information (Header Left)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(seller.name || 'YOUR BUSINESS NAME', 14, 20);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  
  // Wrap seller address if long
  const sellerAddrLines = doc.splitTextToSize(seller.address || '', 110);
  doc.text(sellerAddrLines, 14, 25);
  
  let currentY = 25 + (sellerAddrLines.length * 4);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${seller.gstin || 'N/A'}`, 14, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`State: ${STATE_CODES[seller.stateCode] || 'N/A'} (Code: ${seller.stateCode || '--'})`, 14, currentY + 4);

  // 2. Invoice Document Metadata (Header Right)
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text('TAX INVOICE', 196, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${details.invoiceNumber || '---'}`, 196, 26, { align: 'right' });
  doc.text(`Date: ${details.invoiceDate || '---'}`, 196, 31, { align: 'right' });
  doc.text(`Place of Supply: ${STATE_CODES[buyer.stateCode] || 'N/A'} (Code: ${buyer.stateCode || '--'})`, 196, 36, { align: 'right' });

  // Divider Line
  currentY = Math.max(currentY + 10, 42);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, currentY, 196, currentY);

  // 3. Buyer Information (Bill To)
  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('BILLED TO', 14, currentY);

  currentY += 4.5;
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(buyer.name || 'CLIENT NAME', 14, currentY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const buyerAddrLines = doc.splitTextToSize(buyer.address || '', 120);
  doc.text(buyerAddrLines, 14, currentY + 4);
  
  currentY = currentY + 4 + (buyerAddrLines.length * 4);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN: ${buyer.gstin || 'N/A'}`, 14, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`State: ${STATE_CODES[buyer.stateCode] || 'N/A'} (Code: ${buyer.stateCode || '--'})`, 14, currentY + 4);

  currentY += 10;

  // 4. Line Items Table (using jspdf-autotable)
  const headers = [
    '#',
    'Item Description',
    'HSN/SAC',
    'Qty',
    'Rate',
    'Taxable Value',
    'Tax Rate & Type',
    'Total'
  ];

  const body = items.map((item, index) => {
    const taxDetail = isInterState
      ? `IGST ${item.gstRate}% (${formatCurrency(item.igst)})`
      : `CGST ${item.gstRate / 2}% (${formatCurrency(item.cgst)})\nSGST ${item.gstRate / 2}% (${formatCurrency(item.sgst)})`;

    return [
      index + 1,
      item.description || 'Untitled Item',
      item.hsnCode || '---',
      item.qty,
      formatCurrency(item.rate),
      formatCurrency(item.taxableValue),
      taxDetail,
      formatCurrency(item.total)
    ];
  });

  doc.autoTable({
    startY: currentY,
    head: [headers],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85], // slate-700
      valign: 'top'
    },
    columnStyles: {
      0: { width: 8, halign: 'center' }, // index
      1: { width: 52 }, // description
      2: { width: 16 }, // HSN
      3: { width: 10, halign: 'center' }, // Qty
      4: { width: 22, halign: 'right' }, // Rate
      5: { width: 24, halign: 'right' }, // Taxable value
      6: { width: 28, halign: 'right' }, // Tax rate info
      7: { width: 22, halign: 'right' }  // Total
    },
    styles: {
      cellPadding: 2.5,
      lineColor: [241, 245, 249] // slate-100
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y;
    }
  });

  // 5. Totals & GST Summary Slabs Section
  // Avoid splitting sections across page breaks.
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 10;
  }

  const startY = currentY;

  // Left column: GST Slabs Breakdown
  if (slabSummaries.length > 0) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('GST SLAB SUMMARY', 14, currentY);
    
    currentY += 3.5;
    
    const slabHeaders = ['Rate', 'Taxable Val', isInterState ? 'IGST' : 'CGST + SGST', 'Total Tax'];
    const slabRows = slabSummaries.map((slab) => [
      `${slab.gstRate}%`,
      formatCurrency(slab.taxableValue),
      isInterState 
        ? formatCurrency(slab.igst) 
        : `${formatCurrency(slab.cgst)} + ${formatCurrency(slab.sgst)}`,
      formatCurrency(slab.taxAmount)
    ]);

    doc.autoTable({
      startY: currentY,
      head: [slabHeaders],
      body: slabRows,
      theme: 'plain',
      tableWidth: 105,
      margin: { left: 14 },
      headStyles: {
        fontSize: 7,
        fontStyle: 'bold',
        fillColor: [248, 250, 252], // slate-50
        textColor: [100, 116, 139] // slate-500
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [71, 85, 105]
      },
      columnStyles: {
        0: { width: 12 },
        1: { width: 28, halign: 'right' },
        2: { width: 40, halign: 'right' },
        3: { width: 25, halign: 'right' }
      },
      styles: {
        cellPadding: 1.5
      }
    });
  }

  // Right column: Totals summary
  let totalsY = startY;
  const totalsX = 135;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  
  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal (Taxable Value):', totalsX, totalsY);
  doc.text(formatCurrency(totalTaxableValue), 196, totalsY, { align: 'right' });

  // CGST / SGST / IGST Splits
  if (isInterState) {
    totalsY += 4.5;
    doc.text('IGST (Integrated Tax):', totalsX, totalsY);
    doc.text(formatCurrency(totalIGST), 196, totalsY, { align: 'right' });
  } else {
    totalsY += 4.5;
    doc.text('CGST (Central Tax):', totalsX, totalsY);
    doc.text(formatCurrency(totalCGST), 196, totalsY, { align: 'right' });

    totalsY += 4.5;
    doc.text('SGST (State Tax):', totalsX, totalsY);
    doc.text(formatCurrency(totalSGST), 196, totalsY, { align: 'right' });
  }

  // Total Tax
  totalsY += 5.5;
  doc.setDrawColor(241, 245, 249);
  doc.line(totalsX, totalsY - 3.5, 196, totalsY - 3.5);
  doc.text('Total Tax Amount:', totalsX, totalsY);
  doc.text(formatCurrency(totalTaxAmount), 196, totalsY, { align: 'right' });

  // Grand Total
  totalsY += 7;
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.5);
  doc.line(totalsX, totalsY - 4.5, 196, totalsY - 4.5);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', totalsX, totalsY);
  doc.text(formatCurrency(grandTotal), 196, totalsY, { align: 'right' });

  // 6. Signatory / Footer Block
  const pageHeight = doc.internal.pageSize.height;
  let footerY = pageHeight - 32;

  // Thank you note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business!', 14, footerY + 16);

  // Authorised signatory signature line
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text(`For ${seller.name || 'Your Company'}`, 196, footerY, { align: 'right' });

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.line(145, footerY + 12, 196, footerY + 12);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('AUTHORISED SIGNATORY', 196, footerY + 16, { align: 'right' });

  // Download Action
  const fileName = `${details.invoiceNumber || 'Invoice'}.pdf`;
  doc.save(fileName);
}
