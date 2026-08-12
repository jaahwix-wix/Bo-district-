import React, { useState } from 'react';
import { PaymentReceipt } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { downloadReceiptPDF } from '../utils/pdfGenerator';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Download, 
  Printer, 
  ShieldCheck, 
  ArrowRight,
  DollarSign,
  Calculator,
  QrCode
} from 'lucide-react';

interface PayTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRevenueType?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  defaultChiefdom?: string;
  onPaymentSuccess?: (receipt: PaymentReceipt) => void;
}

export const PayTaxModal: React.FC<PayTaxModalProps> = ({
  isOpen,
  onClose,
  defaultRevenueType = 'Property Rates',
  defaultAmount = 1500,
  defaultDescription = '2026 Fiscal Local Revenue Payment',
  defaultChiefdom = 'Kakua',
  onPaymentSuccess
}) => {
  if (!isOpen) return null;

  // Form State
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerNin, setPayerNin] = useState('');
  const [revenueType, setRevenueType] = useState(defaultRevenueType);
  const [chiefdom, setChiefdom] = useState(defaultChiefdom);
  const [ward, setWard] = useState('Ward 280');
  const [amountNLe, setAmountNLe] = useState<number>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState<'Orange Money' | 'Africell Money' | 'Bank Transfer' | 'Cash at Post'>('Orange Money');
  const [momoNumber, setMomoNumber] = useState('');
  const [description, setDescription] = useState(defaultDescription);

  const [loading, setLoading] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState<PaymentReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Get Wards for selected chiefdom
  const currentChiefdomObj = CHIEFDOMS_DATA.find((c) => c.name === chiefdom) || CHIEFDOMS_DATA[0];
  const wardsList = Array.isArray(currentChiefdomObj.wards) ? currentChiefdomObj.wards : [currentChiefdomObj.wards];

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim()) {
      setErrorMsg('Please enter the tax payer full name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        payerName: payerName.trim(),
        payerPhone: payerPhone.trim() || '+232 76 000 000',
        service: `${revenueType} Assessment`,
        revenueType: revenueType,
        ward: ward,
        chiefdom: chiefdom,
        amountNLe: Number(amountNLe) || 100,
        paymentMethod: paymentMethod,
        collector: `${paymentMethod} Gateway`,
        status: 'Verified',
        description: description.trim() || `Tax payment via ${paymentMethod}`
      };

      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const receipt: PaymentReceipt = await res.json();
        setCreatedReceipt(receipt);
        if (onPaymentSuccess) onPaymentSuccess(receipt);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Failed to process tax payment. Please try again.');
      }
    } catch (err) {
      console.error('Tax payment error:', err);
      setErrorMsg('Network error connecting to Council Treasury. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedReceipt(null);
    setPayerName('');
    setPayerPhone('');
    setPayerNin('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 relative">
          <button 
            onClick={handleReset}
            className="absolute right-4 top-4 p-2 text-emerald-300 hover:text-white bg-emerald-900/50 hover:bg-emerald-800 rounded-full transition-colors"
            id="pay-tax-modal-close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500 text-emerald-950 font-black rounded-xl text-xs">
              BO DC
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Official Revenue Portal
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black mt-2">
            {createdReceipt ? 'Tax Payment Confirmed!' : 'Pay Local Taxes & Council Dues'}
          </h2>
          <p className="text-xs text-emerald-200/90 mt-1">
            {createdReceipt 
              ? 'Official Treasury receipt generated with digital security verification hash.' 
              : 'Direct mobile money or bank transfer tax settlement for Bo District Council.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {createdReceipt ? (
            /* SUCCESS CONFIRMATION STEP */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono font-bold text-xs rounded-full inline-block">
                  Receipt No: {createdReceipt.receiptNo}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  NLe {(createdReceipt.amountNLe || 0).toLocaleString()}.00 Paid
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Payer: <strong>{createdReceipt.payerName}</strong> ({createdReceipt.revenueType})
                </p>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Chiefdom & Ward:</span>
                  <span className="font-bold text-slate-800">{createdReceipt.chiefdom} ({createdReceipt.ward})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-slate-800">{createdReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold text-slate-800">{createdReceipt.date}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Security Hash:</span>
                  <span className="font-mono font-bold text-emerald-800">{createdReceipt.securityHash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => downloadReceiptPDF(createdReceipt)}
                  className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                  id="pay-tax-download-pdf"
                >
                  <Download className="w-4 h-4" />
                  Download Official PDF Receipt
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-700 underline"
                >
                  Make Another Tax Payment
                </button>
              </div>
            </div>
          ) : (
            /* PAYMENT FORM STEP */
            <form onSubmit={handlePaySubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
                  {errorMsg}
                </div>
              )}

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax / Revenue Category *</label>
                  <select
                    value={revenueType}
                    onChange={(e) => setRevenueType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-category-select"
                  >
                    <option value="Property Rates">🏡 Property Rates (Annual Building Tax)</option>
                    <option value="Local Tax">👤 Local Tax (NLe 50/adult citizen)</option>
                    <option value="Business License">🏪 Business Operating Licence Fee</option>
                    <option value="Market Dues">🥬 Market Stall & Trade Dues</option>
                    <option value="Building Permits">🏗️ Building & Structural Permit Fee</option>
                    <option value="Mining & Artisanal Fees">💎 Artisanal Mining License Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Pay (NLe) *</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={amountNLe}
                    onChange={(e) => setAmountNLe(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-amount-input"
                  />
                </div>
              </div>

              {/* Payer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sahr Brima"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-payer-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+232 76 123 456"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-payer-phone"
                  />
                </div>
              </div>

              {/* Chiefdom & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom Jurisdiction</label>
                  <select
                    value={chiefdom}
                    onChange={(e) => setChiefdom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-chiefdom-select"
                  >
                    {CHIEFDOMS_DATA.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ward Number</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="pay-tax-ward-select"
                  >
                    {wardsList.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Payment Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Orange Money')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'Orange Money'
                        ? 'bg-amber-500 text-emerald-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] block">Orange Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Africell Money')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'Africell Money'
                        ? 'bg-amber-500 text-emerald-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] block">Africell Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank Transfer')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'Bank Transfer'
                        ? 'bg-amber-500 text-emerald-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] block">Rokel / Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash at Post')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      paymentMethod === 'Cash at Post'
                        ? 'bg-amber-500 text-emerald-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] block">Revenue Post</span>
                  </button>
                </div>
              </div>

              {/* Payment Channel Instructions */}
              <div className="bg-emerald-950 text-emerald-100 p-3.5 rounded-xl border border-emerald-800 text-[11px] space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official Instruction for {paymentMethod}:
                </div>
                {paymentMethod === 'Orange Money' && (
                  <p>Dial <strong>*144*4*8#</strong> on your phone. Enter Merchant Code <strong className="text-amber-300">50502</strong> (Bo District Council).</p>
                )}
                {paymentMethod === 'Africell Money' && (
                  <p>Dial <strong>*161#</strong> → Pay Bills → Select <strong className="text-amber-300">Bo District Council</strong>.</p>
                )}
                {paymentMethod === 'Bank Transfer' && (
                  <p>Deposit/Transfer to Rokel Commercial Bank, Bo Branch: Account <strong className="text-amber-300">0100238120</strong>.</p>
                )}
                {paymentMethod === 'Cash at Post' && (
                  <p>Pay cash directly at Fenton Road Council Treasury or Chiefdom Headquarters Revenue Desk.</p>
                )}
              </div>

              {/* Remarks / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Fiscal Period</label>
                <input
                  type="text"
                  placeholder="e.g. 2026 Annual Property Assessment Dues"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  id="pay-tax-description"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  id="pay-tax-submit-btn"
                >
                  {loading ? (
                    <span>Processing Treasury Settlement...</span>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      Complete Payment & Issue Receipt (NLe {amountNLe.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
