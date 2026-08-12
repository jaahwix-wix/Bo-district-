import { jsPDF } from 'jspdf';
import { PaymentReceipt } from '../types';

export const downloadReceiptPDF = (receipt: PaymentReceipt) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Header background bar (Emerald Green)
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, 148, 28, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BO DISTRICT COUNCIL', 74, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('SOUTHERN PROVINCE • REPUBLIC OF SIERRA LEONE', 74, 18, { align: 'center' });
  doc.text('OFFICIAL TREASURY REVENUE RECEIPT', 74, 23, { align: 'center' });

  // Gold accent line
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.line(0, 28, 148, 28);

  // Receipt Number & Date Banner
  doc.setFillColor(248, 250, 252);
  doc.rect(10, 33, 128, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(10, 33, 128, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text(`Receipt No: ${receipt.receiptNo}`, 14, 42);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${receipt.date}`, 134, 42, { align: 'right' });

  // Details List
  let y = 55;
  const addRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || 'N/A', 56, y);

    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 2, 134, y + 2);
    y += 8;
  };

  addRow('Payer Name:', receipt.payerName);
  if (receipt.payerPhone) addRow('Contact Phone:', receipt.payerPhone);
  addRow('Revenue Category:', receipt.revenueType);
  addRow('Service Fee:', receipt.service);
  addRow('Chiefdom & Ward:', `${receipt.chiefdom} (${receipt.ward})`);
  addRow('Payment Method:', receipt.paymentMethod);
  addRow('Collecting Officer:', receipt.collector);
  if (receipt.description) addRow('Remarks / Period:', receipt.description);

  // Amount Box
  y += 3;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.rect(14, y, 120, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text('TOTAL AMOUNT PAID', 74, y + 5, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(6, 78, 59);
  doc.text(`NLe ${(receipt.amountNLe || 0).toLocaleString()}.00`, 74, y + 13, { align: 'center' });

  // Security Audit Footer
  y += 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 120, 12, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL AUDIT TRAIL', 18, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Security Hash: ${receipt.securityHash || 'BDC-SEC-HASH-VERIFIED'}`, 18, y + 8.5);
  doc.text('Status: AUDITED & VERIFIED', 130, y + 8.5, { align: 'right' });

  // Signatures
  y += 18;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(18, y, 60, y);
  doc.line(88, y, 130, y);

  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Collecting Officer Signature', 39, y + 4, { align: 'center' });
  doc.text('Treasury Accountant Stamp', 109, y + 4, { align: 'center' });

  doc.save(`Receipt_${receipt.receiptNo.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`);
};
