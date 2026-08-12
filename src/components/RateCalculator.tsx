import React, { useState } from 'react';
import { PayTaxModal } from './PayTaxModal';
import { 
  Calculator, 
  Building, 
  CheckCircle2, 
  Printer, 
  CreditCard, 
  Phone, 
  Download, 
  Info, 
  DollarSign, 
  HelpCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const RateCalculator: React.FC = () => {
  // Inputs
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial' | 'industrial' | 'agricultural'>('residential');
  const [locationZone, setLocationZone] = useState<'zoneA' | 'zoneB' | 'zoneC'>('zoneA');
  const [buildingMaterial, setBuildingMaterial] = useState<'concrete' | 'plastered' | 'timber'>('concrete');
  const [roomsOrArea, setRoomsOrArea] = useState<number>(4);
  const [estimatedValueNLe, setEstimatedValueNLe] = useState<number>(150000);
  const [occupantsCount, setOccupantsCount] = useState<number>(2);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const [generatedSlip, setGeneratedSlip] = useState<{
    assessmentRef: string;
    propertyTypeLabel: string;
    zoneLabel: string;
    assessedValue: number;
    annualRateFee: number;
    localTaxAmount: number;
    totalAmountDue: number;
    dueDate: string;
  } | null>(null);

  // Calculation Logic
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Multipliers based on Sierra Leone local government rate guidelines
    let ratePercentage = 0.0020; // 0.2% base
    if (propertyType === 'commercial') ratePercentage = 0.0035;
    if (propertyType === 'industrial') ratePercentage = 0.0045;
    if (propertyType === 'agricultural') ratePercentage = 0.0015;

    // Zone multiplier
    let zoneMultiplier = 1.2; // Zone A
    if (locationZone === 'zoneB') zoneMultiplier = 1.0;
    if (locationZone === 'zoneC') zoneMultiplier = 0.8;

    // Construction quality multiplier
    let materialMultiplier = 1.1; // Concrete
    if (buildingMaterial === 'plastered') materialMultiplier = 0.9;
    if (buildingMaterial === 'timber') materialMultiplier = 0.7;

    const baseValuation = Math.max(estimatedValueNLe, roomsOrArea * 15000);
    const annualRateFee = Math.round(baseValuation * ratePercentage * zoneMultiplier * materialMultiplier);
    const localTaxAmount = occupantsCount * 50; // NLe 50 per adult local tax
    const totalAmountDue = annualRateFee + localTaxAmount;

    const randomRef = `BDC-RATE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    setGeneratedSlip({
      assessmentRef: randomRef,
      propertyTypeLabel: 
        propertyType === 'residential' ? 'Residential Property' :
        propertyType === 'commercial' ? 'Commercial Trade / Storefront' :
        propertyType === 'industrial' ? 'Industrial / Processing Plant' : 'Agricultural Enterprise Warehouse',
      zoneLabel: 
        locationZone === 'zoneA' ? 'Zone A (Bo Periphery / Kakua Wards)' :
        locationZone === 'zoneB' ? 'Zone B (Highway Chiefdom Hubs e.g. Tikonko, Koribondo)' : 'Zone C (Rural Chiefdom Wards)',
      assessedValue: baseValuation,
      annualRateFee,
      localTaxAmount,
      totalAmountDue,
      dueDate: '2026-11-30'
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Property Rate & Local Tax Estimator
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Calculate property assessment dues and local development rates under the Sierra Leone Local Government Act.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
            id="rate-pay-tax-header-btn"
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            Pay Tax & Dues Online
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Official Council Schedule (2026)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Form (Left) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Enter Property & Building Details
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Property Usage Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                id="rate-type-select"
              >
                <option value="residential">🏠 Residential Dwelling / Compound</option>
                <option value="commercial">🏬 Commercial Storefront / Market Shop</option>
                <option value="industrial">🏭 Processing Plant / Rice Mill / Mining Yard</option>
                <option value="agricultural">🌾 Commercial Farm Produce Warehouse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location Zone Band
              </label>
              <select
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                id="rate-zone-select"
              >
                <option value="zoneA">Zone A: Bo City Periphery / Kakua Wards</option>
                <option value="zoneB">Zone B: Highway Chiefdom Hubs (Tikonko, Koribondo, Baoma)</option>
                <option value="zoneC">Zone C: Rural Chiefdom Wards (Lugbu, Valunia, Wonde, etc.)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Building Material
                </label>
                <select
                  value={buildingMaterial}
                  onChange={(e) => setBuildingMaterial(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  id="rate-material-select"
                >
                  <option value="concrete">Concrete Block / Rendered Cement</option>
                  <option value="plastered">Mud Brick / Plastered</option>
                  <option value="timber">Corrugated Iron / Timber Frame</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Rooms / Units
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={roomsOrArea}
                  onChange={(e) => setRoomsOrArea(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  id="rate-rooms-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Property Value (NLe)
                </label>
                <input
                  type="number"
                  step={10000}
                  min={20000}
                  value={estimatedValueNLe}
                  onChange={(e) => setEstimatedValueNLe(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  id="rate-value-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adult Occupants (Local Tax NLe 50/ea)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={occupantsCount}
                  onChange={(e) => setOccupantsCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  id="rate-occupants-input"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
                id="rate-calculate-btn"
              >
                <Calculator className="w-4 h-4" />
                Generate Assessment Rate Slip
              </button>
            </div>
          </form>
        </div>

        {/* Assessment Slip Preview (Right) */}
        <div className="lg:col-span-6 space-y-4">
          {generatedSlip ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-800 shadow-md p-6 space-y-5 relative overflow-hidden">
              {/* Decorative Seal Background */}
              <div className="absolute right-4 top-4 text-emerald-900/5 font-black text-6xl pointer-events-none select-none">
                BO DC
              </div>

              <div className="border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {generatedSlip.assessmentRef}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">2026 Fiscal Assessment</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Bo District Council Rate Slip
                </h3>
                <p className="text-xs text-slate-500">Official Local Revenue Estimate • Republic of Sierra Leone</p>
              </div>

              {/* Assessment Breakdown Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Property Usage</span>
                  <span className="font-semibold text-slate-900">{generatedSlip.propertyTypeLabel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Location Zone</span>
                  <span className="font-semibold text-slate-900">{generatedSlip.zoneLabel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assessed Base Valuation</span>
                  <span className="font-mono font-semibold text-slate-900">NLe {(generatedSlip.assessedValue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Annual Property Rate Dues</span>
                  <span className="font-mono font-semibold text-emerald-800">NLe {(generatedSlip.annualRateFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Local Tax ({occupantsCount} Adult Adults @ NLe 50)</span>
                  <span className="font-mono font-semibold text-slate-900">NLe {(generatedSlip.localTaxAmount || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 bg-emerald-950 text-white rounded-xl px-4 text-sm font-bold mt-3">
                  <span>TOTAL ANNUAL DUE</span>
                  <span className="font-mono text-amber-400 text-base">
                    NLe {(generatedSlip.totalAmountDue || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Action & Channels */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsPayModalOpen(true)}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  id="rate-pay-slip-btn"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay Tax Online Now (NLe {(generatedSlip.totalAmountDue || 0).toLocaleString()})
                </button>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    Official Payment Channels
                  </h4>
                  <ul className="text-slate-600 space-y-1 text-[11px]">
                    <li>• <strong>Orange Money:</strong> Dial *144*4*8# (Merchant Code: <code className="text-emerald-800 font-bold">50502</code>)</li>
                    <li>• <strong>Africell Money:</strong> Dial *161# (Pay Bills → Bo District Council)</li>
                    <li>• <strong>Rokel Commercial Bank:</strong> Bo Branch - Account <code className="font-bold">0100238120</code></li>
                    <li>• <strong>Council Treasury:</strong> Fenton Road, Bo (Mon-Fri 8:00 AM - 4:30 PM)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-400 text-[10px]">Reference: {generatedSlip.assessmentRef}</span>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Rate Slip
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Calculator className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Generate Your Rate Assessment</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Fill in the property details on the left to view your official 2026 assessment dues and bank payment codes.
              </p>
            </div>
          )}

          {/* Rate Policy Info Box */}
          <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800 text-xs space-y-2">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Why Pay Property Rates & Local Taxes?
            </h4>
            <p className="leading-relaxed">
              100% of local revenues collected directly fund Chiefdom feeder road maintenance, market stalls in Tikonko and Koribondo, clean water boreholes, and peripheral health clinic repairs across Bo District.
            </p>
          </div>
        </div>
      </div>

      {/* Pay Tax Modal */}
      <PayTaxModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        defaultRevenueType={generatedSlip?.propertyTypeLabel ? 'Property Rates' : 'Local Tax'}
        defaultAmount={generatedSlip?.totalAmountDue || 1500}
        defaultDescription={generatedSlip ? `2026 Assessment Dues Ref: ${generatedSlip.assessmentRef}` : '2026 Fiscal Local Revenue Settlement'}
      />
    </div>
  );
};
