import React, { useState } from 'react';
import { PaymentReceipt } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { downloadReceiptPDF } from '../utils/pdfGenerator';
import { PayTaxModal } from './PayTaxModal';
import { 
  DollarSign, 
  Receipt, 
  CheckCircle2, 
  Search, 
  Printer, 
  Download, 
  ShieldCheck, 
  TrendingUp, 
  QrCode, 
  Calendar, 
  Building2, 
  CreditCard, 
  PlusCircle, 
  X,
  FileCheck2,
  PieChart
} from 'lucide-react';

interface RevenueAndReceiptsProps {
  receipts: PaymentReceipt[];
  onAddReceipt: (receipt: PaymentReceipt) => void;
}

export const RevenueAndReceipts: React.FC<RevenueAndReceiptsProps> = ({
  receipts,
  onAddReceipt
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'ledger' | 'verify'>('overview');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // New Payment Form State
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [service, setService] = useState('Business Licence');
  const [revenueType, setRevenueType] = useState('Business Licences');
  const [chiefdom, setChiefdom] = useState(CHIEFDOMS_DATA[0].name);
  const [ward, setWard] = useState('Ward 280');
  const [amountNLe, setAmountNLe] = useState('1500');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [collector, setCollector] = useState('Council Officer Brima Mansaray');
  const [description, setDescription] = useState('');
  const [createdReceipt, setCreatedReceipt] = useState<PaymentReceipt | null>(null);

  // Receipt Modal View State
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceipt | null>(null);

  // Receipt Verification Tool State
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    searched: boolean;
    found: boolean;
    receipt?: PaymentReceipt;
  }>({ searched: false, found: false });

  // Calculated Summaries
  const totalRevenueNLe = receipts.reduce((sum, r) => sum + r.amountNLe, 0);

  const revenueByType = receipts.reduce((acc, r) => {
    acc[r.revenueType] = (acc[r.revenueType] || 0) + r.amountNLe;
    return acc;
  }, {} as Record<string, number>);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || !amountNLe) return;

    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerName,
          payerPhone,
          service,
          revenueType,
          ward,
          chiefdom,
          amountNLe: Number(amountNLe),
          paymentMethod,
          collector,
          description
        })
      });

      if (res.ok) {
        const newR = await res.json();
        onAddReceipt(newR);
        setCreatedReceipt(newR);
        setViewingReceipt(newR);

        // Reset form
        setPayerName('');
        setPayerPhone('');
        setDescription('');
      }
    } catch (err) {
      console.error('Failed to issue receipt:', err);
    }
  };

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    const match = receipts.find(
      r => r.receiptNo.toLowerCase() === verifyInput.trim().toLowerCase() ||
           r.id.toLowerCase() === verifyInput.trim().toLowerCase()
    );

    if (match) {
      setVerifyResult({ searched: true, found: true, receipt: match });
    } else {
      setVerifyResult({ searched: true, found: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            Bo District Council • Financial Revenue System
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">
            Revenue Management & Official Digital Receipts
          </h1>
          <p className="text-xs md:text-sm text-emerald-200 mt-1">
            Real-time daily/weekly revenue tracking, official payment receipts, and public receipt verification.
          </p>
        </div>

        {/* Tab Controls & Pay Tax CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
            id="revenue-pay-tax-btn"
          >
            <DollarSign className="w-4 h-4" />
            Pay Taxes Online
          </button>

          <div className="flex items-center gap-1 bg-emerald-900 p-1.5 rounded-xl border border-emerald-800 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Revenue Analytics
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'terminal'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Issue Receipt
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Ledger ({receipts.length})
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'verify'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Verify Receipt
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Collected Revenue</span>
              <div className="text-2xl font-black text-emerald-900 font-mono">
                NLe {(totalRevenueNLe || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Live fiscal 2026 total
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Business Licences</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                NLe {(revenueByType['Business Licences'] || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Commercial trade fees</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Building & Property Fees</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                NLe {((revenueByType['Building Permits'] || 0) + (revenueByType['Property Rates'] || 0)).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Permits & rate assessments</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Market Dues & Local Charges</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                NLe {(revenueByType['Market Dues'] || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Chiefdom market collections</div>
            </div>
          </div>

          {/* Revenue Source Breakdown Bars */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Revenue Breakdown by Category
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Business Licences', amount: revenueByType['Business Licences'] || 0 },
                { name: 'Building Permits', amount: revenueByType['Building Permits'] || 0 },
                { name: 'Property Rates', amount: revenueByType['Property Rates'] || 0 },
                { name: 'Market Dues', amount: revenueByType['Market Dues'] || 0 },
                { name: 'Sanitation & Land Fees', amount: 850 }
              ].map((item, idx) => {
                const percentage = totalRevenueNLe > 0 ? Math.round((item.amount / totalRevenueNLe) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.name}</span>
                      <span className="font-mono">NLe {(item.amount || 0).toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            Issue Official Payment Receipt (Council Treasury)
          </h2>

          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payer / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Kamara"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payer Phone Contact</label>
                <input
                  type="text"
                  placeholder="+232 76 000 000"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service / Fee Description</label>
                <select
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    if (e.target.value.includes('Licence')) setRevenueType('Business Licences');
                    else if (e.target.value.includes('Permit')) setRevenueType('Building Permits');
                    else if (e.target.value.includes('Rate')) setRevenueType('Property Rates');
                    else setRevenueType('Market Dues');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Business Licence">Business Licence Fee</option>
                  <option value="Market Dues">Market Stall Dues</option>
                  <option value="Building Permit">Building & Civil Permit</option>
                  <option value="Property Rate">Property Rate Assessment</option>
                  <option value="Land Fee">Land Transaction Fee</option>
                  <option value="Sanitation Fee">Sanitation & Refuse Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (NLe) *</label>
                <input
                  type="number"
                  required
                  value={amountNLe}
                  onChange={(e) => setAmountNLe(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom</label>
                <select
                  value={chiefdom}
                  onChange={(e) => setChiefdom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  {CHIEFDOMS_DATA.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 280"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Cash">Cash (Treasury Cashier)</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Africell Money">Africell Money</option>
                  <option value="Bank Transfer (Rokel Bank)">Bank Transfer (Rokel Bank)</option>
                  <option value="Bank Transfer (SLCB)">Bank Transfer (SLCB)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Collecting Officer</label>
                <input
                  type="text"
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Remarks / Period Covered</label>
              <textarea
                rows={2}
                placeholder="e.g. Annual commercial provisions trade license fee 2026"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              Generate Official Digital Receipt & Record Revenue
            </button>
          </form>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex justify-between items-center">
            <span>Official Revenue Receipts Ledger</span>
            <span className="text-xs font-mono text-slate-500 font-normal">{receipts.length} total entries</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Payer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Chiefdom / Ward</th>
                  <th className="p-3">Amount (NLe)</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-900">{r.receiptNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{r.payerName}</td>
                    <td className="p-3 text-slate-700">{r.service}</td>
                    <td className="p-3 text-slate-600">{r.chiefdom} ({r.ward})</td>
                    <td className="p-3 font-mono font-bold text-slate-900">NLe {(r.amountNLe || 0).toLocaleString()}</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">{r.paymentMethod}</span></td>
                    <td className="p-3 text-slate-500">{r.date}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingReceipt(r)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded text-[11px] transition-colors"
                          title="View Receipt Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadReceiptPDF(r)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[11px] transition-colors flex items-center gap-1"
                          title="Download PDF Receipt"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-5 text-center">
          <div>
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Verify Official Council Receipt</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter any Bo District Council receipt number to verify authenticity against the central ledger.
            </p>
          </div>

          <form onSubmit={handleVerifySearch} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. BDC-2026-000154"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Verify
            </button>
          </form>

          {verifyResult.searched && (
            <div className="pt-2 text-left">
              {verifyResult.found && verifyResult.receipt ? (
                <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>AUTHENTIC COUNCIL RECEIPT VERIFIED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-2 border-t border-emerald-200 font-mono">
                    <div>Receipt No: <strong>{verifyResult.receipt.receiptNo}</strong></div>
                    <div>Payer: <strong>{verifyResult.receipt.payerName}</strong></div>
                    <div>Service: <strong>{verifyResult.receipt.service}</strong></div>
                    <div>Amount: <strong>NLe {(verifyResult.receipt.amountNLe || 0).toLocaleString()}</strong></div>
                    <div>Ward: <strong>{verifyResult.receipt.ward}</strong></div>
                    <div>Hash: <strong>{verifyResult.receipt.securityHash}</strong></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setViewingReceipt(verifyResult.receipt!)}
                      className="flex-1 py-2 bg-emerald-800 text-white font-bold rounded-xl text-xs"
                    >
                      Open Printable Receipt
                    </button>
                    <button
                      onClick={() => downloadReceiptPDF(verifyResult.receipt!)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-300 p-4 rounded-2xl text-xs text-rose-800 font-bold">
                  ❌ Receipt number not found in official Bo District Council records. Please inspect slip carefully.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Official Receipt Printable Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-5 text-slate-900">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-900 text-amber-400 font-black text-xs flex items-center justify-center mx-auto mb-1">
                BDC
              </div>
              <h2 className="font-extrabold text-sm tracking-wider uppercase text-emerald-950">
                BO DISTRICT COUNCIL
              </h2>
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                SIERRA LEONE • SOUTHERN PROVINCE
              </p>
              <div className="pt-2 text-xs font-black uppercase text-amber-700 tracking-widest">
                OFFICIAL PAYMENT RECEIPT
              </div>
            </div>

            {/* Receipt Content */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-emerald-900">{viewingReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Payer Name:</span>
                <span className="font-bold">{viewingReceipt.payerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Service Fee:</span>
                <span className="font-bold">{viewingReceipt.service}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Chiefdom / Ward:</span>
                <span className="font-bold">{viewingReceipt.chiefdom} ({viewingReceipt.ward})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold">{viewingReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-bold">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Collector:</span>
                <span className="font-bold">{viewingReceipt.collector}</span>
              </div>

              {/* Big Amount */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center my-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Amount Paid</span>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">
                  NLe {(viewingReceipt.amountNLe || 0).toLocaleString()}.00
                </div>
              </div>

              {/* Verification Security Badge */}
              <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>VERIFIED FINANCIAL AUDIT TRAIL</span>
                </div>
                <span className="text-slate-500 font-mono">{viewingReceipt.securityHash}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => downloadReceiptPDF(viewingReceipt)}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Tax Modal */}
      <PayTaxModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onPaymentSuccess={(newReceipt) => {
          if (onAddReceipt) onAddReceipt(newReceipt);
        }}
      />
    </div>
  );
};
