import React, { useState } from 'react';
import { BusinessLicence, BuildingPermit, ChiefdomInfo } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Building2, 
  Briefcase, 
  Search, 
  ShieldCheck, 
  Calendar, 
  DollarSign,
  Award,
  Edit3,
  Trash2,
  X
} from 'lucide-react';

interface LicencesAndPermitsProps {
  licences: BusinessLicence[];
  permits: BuildingPermit[];
  chiefdoms?: ChiefdomInfo[];
  onAddLicence: (licence: BusinessLicence) => void;
  onUpdateLicence?: (licence: BusinessLicence) => void;
  onDeleteLicence?: (licenceId: string) => void;
  onAddPermit: (permit: BuildingPermit) => void;
  onUpdatePermit?: (permit: BuildingPermit) => void;
  onDeletePermit?: (permitId: string) => void;
}

export const LicencesAndPermits: React.FC<LicencesAndPermitsProps> = ({
  licences,
  permits,
  chiefdoms = CHIEFDOMS_DATA,
  onAddLicence,
  onUpdateLicence,
  onDeleteLicence,
  onAddPermit,
  onUpdatePermit,
  onDeletePermit
}) => {
  const [activeTab, setActiveTab] = useState<'licences' | 'permits' | 'new_licence' | 'new_permit'>('licences');
  const [searchTerm, setSearchTerm] = useState('');

  // Business Licence Form
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState('General Trade');
  const [location, setLocation] = useState('');
  const [licenceChiefdom, setLicenceChiefdom] = useState(chiefdoms[0]?.name || CHIEFDOMS_DATA[0].name);
  const [licenceWard, setLicenceWard] = useState('Ward 280');
  const [licenceFee, setLicenceFee] = useState('1500');

  // Building Permit Form
  const [applicantName, setApplicantName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [permitChiefdom, setPermitChiefdom] = useState(chiefdoms[0]?.name || CHIEFDOMS_DATA[0].name);
  const [permitWard, setPermitWard] = useState('Ward 280');
  const [projectType, setProjectType] = useState('Residential Construction');
  const [estimatedValue, setEstimatedValue] = useState('200000');
  const [feePaid, setFeePaid] = useState('2000');

  // Edit Licence Modal State
  const [editingLicence, setEditingLicence] = useState<BusinessLicence | null>(null);
  const [deletingLicenceId, setDeletingLicenceId] = useState<string | null>(null);

  // Edit Permit Modal State
  const [editingPermit, setEditingPermit] = useState<BuildingPermit | null>(null);
  const [deletingPermitId, setDeletingPermitId] = useState<string | null>(null);

  const filteredLicences = licences.filter(l => 
    l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.licenceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermits = permits.filter(p =>
    p.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.permitNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.propertyLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssueLicence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName) return;

    try {
      const res = await fetch('/api/licences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          ownerName,
          businessType,
          location,
          chiefdom: licenceChiefdom,
          ward: licenceWard,
          amountPaidNLe: Number(licenceFee)
        })
      });

      if (res.ok) {
        const newL = await res.json();
        onAddLicence(newL);
        setActiveTab('licences');

        // Reset
        setBusinessName('');
        setOwnerName('');
        setLocation('');
      }
    } catch (err) {
      console.error('Failed to issue licence:', err);
    }
  };

  const handleSaveEditLicence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicence) return;

    try {
      const res = await fetch(`/api/licences/${editingLicence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLicence)
      });

      if (res.ok) {
        const updated = await res.json();
        if (onUpdateLicence) onUpdateLicence(updated);
        setEditingLicence(null);
      }
    } catch (err) {
      console.error('Failed to update licence:', err);
    }
  };

  const handleDeleteLicenceConfirm = async () => {
    if (!deletingLicenceId) return;

    try {
      const res = await fetch(`/api/licences/${deletingLicenceId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (onDeleteLicence) onDeleteLicence(deletingLicenceId);
        setDeletingLicenceId(null);
      }
    } catch (err) {
      console.error('Failed to delete licence:', err);
    }
  };

  const handleApplyPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !propertyLocation) return;

    try {
      const res = await fetch('/api/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          propertyLocation,
          chiefdom: permitChiefdom,
          ward: permitWard,
          projectType,
          estimatedValueNLe: Number(estimatedValue),
          feePaidNLe: Number(feePaid)
        })
      });

      if (res.ok) {
        const newP = await res.json();
        onAddPermit(newP);
        setActiveTab('permits');

        // Reset
        setApplicantName('');
        setPropertyLocation('');
      }
    } catch (err) {
      console.error('Failed to issue permit:', err);
    }
  };

  const handleSaveEditPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermit) return;

    try {
      const res = await fetch(`/api/permits/${editingPermit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPermit)
      });

      if (res.ok) {
        const updated = await res.json();
        if (onUpdatePermit) onUpdatePermit(updated);
        setEditingPermit(null);
      }
    } catch (err) {
      console.error('Failed to update permit:', err);
    }
  };

  const handleDeletePermitConfirm = async () => {
    if (!deletingPermitId) return;

    try {
      const res = await fetch(`/api/permits/${deletingPermitId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (onDeletePermit) onDeletePermit(deletingPermitId);
        setDeletingPermitId(null);
      }
    } catch (err) {
      console.error('Failed to delete permit:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Bo District Council • Licensing & Permits Bureau
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">
            Business Licences & Building Permits Registry
          </h1>
          <p className="text-xs md:text-sm text-emerald-200 mt-1">
            Digital processing, update/edit records, expiration tracking, and structural compliance management.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-emerald-900 p-1.5 rounded-xl border border-emerald-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('licences')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'licences'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Business Licences ({licences.length})
          </button>

          <button
            onClick={() => setActiveTab('permits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'permits'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            Building Permits ({permits.length})
          </button>

          <button
            onClick={() => setActiveTab('new_licence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'new_licence'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            + Issue Licence
          </button>

          <button
            onClick={() => setActiveTab('new_permit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'new_permit'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            + Issue Permit
          </button>
        </div>
      </div>

      {activeTab === 'licences' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Registered Business Licences</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search licence or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLicences.map((l) => (
              <div key={l.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900">{l.licenceNo}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {l.status}
                    </span>
                    <button
                      onClick={() => setEditingLicence(l)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Edit Licence"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingLicenceId(l.id)}
                      className="p-1 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Licence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{l.businessName}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Owner: <strong>{l.ownerName}</strong></p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200 font-medium">
                  <div>Category: {l.businessType}</div>
                  <div>Location: {l.location}, {l.chiefdom} ({l.ward})</div>
                  <div className="flex justify-between font-mono font-bold text-slate-700 pt-1">
                    <span>Paid: NLe {(l.amountPaidNLe || 0).toLocaleString()}</span>
                    <span>Expires: {l.expiryDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permits' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Building & Construction Permits</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search permit or applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPermits.map((p) => (
              <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900">{p.permitNo}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      {p.approvalStatus}
                    </span>
                    <button
                      onClick={() => setEditingPermit(p)}
                      className="p-1 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Edit Permit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingPermitId(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Permit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{p.projectType}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Applicant: <strong>{p.applicantName}</strong></p>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <div>Property Site: {p.propertyLocation}, {p.chiefdom} ({p.ward})</div>
                  <div className="flex justify-between font-mono font-bold text-slate-800 pt-1">
                    <span>Est. Value: NLe {(p.estimatedValueNLe || 0).toLocaleString()}</span>
                    <span>Fee: NLe {(p.feePaidNLe || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'new_licence' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Issue Business Licence (Official Registration)
          </h2>

          <form onSubmit={handleIssueLicence} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bo Central Agro Trade"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Manager Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Francis Momoh"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Fee (NLe)</label>
                <input
                  type="number"
                  value={licenceFee}
                  onChange={(e) => setLicenceFee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom</label>
                <select
                  value={licenceChiefdom}
                  onChange={(e) => setLicenceChiefdom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                >
                  {chiefdoms.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
                <input
                  type="text"
                  value={licenceWard}
                  onChange={(e) => setLicenceWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Premises Address</label>
              <input
                type="text"
                placeholder="e.g. 12 Fenton Road"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Issue Business Licence & Log Revenue
            </button>
          </form>
        </div>
      )}

      {activeTab === 'new_permit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Issue Building Permit
          </h2>

          <form onSubmit={handleApplyPermit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Name *</label>
              <input
                type="text"
                required
                placeholder="Individual or Corporate Applicant"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Structure / Project Description</label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value (NLe)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Permit Fee (NLe)</label>
                <input
                  type="number"
                  value={feePaid}
                  onChange={(e) => setFeePaid(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Property Location Site</label>
              <input
                type="text"
                placeholder="e.g. Section 4 Tikonko Road"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Approve & Issue Building Permit
            </button>
          </form>
        </div>
      )}

      {/* EDIT LICENCE MODAL */}
      {editingLicence && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Business Licence</h3>
              <button onClick={() => setEditingLicence(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLicence} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={editingLicence.businessName}
                  onChange={(e) => setEditingLicence({ ...editingLicence, businessName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={editingLicence.ownerName}
                  onChange={(e) => setEditingLicence({ ...editingLicence, ownerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingLicence.businessType}
                    onChange={(e) => setEditingLicence({ ...editingLicence, businessType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingLicence.status}
                    onChange={(e) => setEditingLicence({ ...editingLicence, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom</label>
                  <select
                    value={editingLicence.chiefdom}
                    onChange={(e) => setEditingLicence({ ...editingLicence, chiefdom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    {chiefdoms.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={editingLicence.ward}
                    onChange={(e) => setEditingLicence({ ...editingLicence, ward: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Address</label>
                <input
                  type="text"
                  value={editingLicence.location}
                  onChange={(e) => setEditingLicence({ ...editingLicence, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (NLe)</label>
                  <input
                    type="number"
                    value={editingLicence.amountPaidNLe}
                    onChange={(e) => setEditingLicence({ ...editingLicence, amountPaidNLe: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingLicence.expiryDate}
                    onChange={(e) => setEditingLicence({ ...editingLicence, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLicence(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE LICENCE CONFIRMATION */}
      {deletingLicenceId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Business Licence?</h3>
              <p className="text-xs text-slate-500 mt-1">This action will permanently remove this licence record from the Bo District Council registry.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingLicenceId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLicenceConfirm}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERMIT MODAL */}
      {editingPermit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Building Permit</h3>
              <button onClick={() => setEditingPermit(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPermit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Name</label>
                <input
                  type="text"
                  value={editingPermit.applicantName}
                  onChange={(e) => setEditingPermit({ ...editingPermit, applicantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Structure / Project Type</label>
                <input
                  type="text"
                  value={editingPermit.projectType}
                  onChange={(e) => setEditingPermit({ ...editingPermit, projectType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={editingPermit.approvalStatus}
                    onChange={(e) => setEditingPermit({ ...editingPermit, approvalStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Under Assessment">Under Assessment</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Location Site</label>
                  <input
                    type="text"
                    value={editingPermit.propertyLocation}
                    onChange={(e) => setEditingPermit({ ...editingPermit, propertyLocation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom</label>
                  <select
                    value={editingPermit.chiefdom}
                    onChange={(e) => setEditingPermit({ ...editingPermit, chiefdom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    {chiefdoms.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={editingPermit.ward}
                    onChange={(e) => setEditingPermit({ ...editingPermit, ward: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Value (NLe)</label>
                  <input
                    type="number"
                    value={editingPermit.estimatedValueNLe}
                    onChange={(e) => setEditingPermit({ ...editingPermit, estimatedValueNLe: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Permit Fee (NLe)</label>
                  <input
                    type="number"
                    value={editingPermit.feePaidNLe}
                    onChange={(e) => setEditingPermit({ ...editingPermit, feePaidNLe: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPermit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PERMIT CONFIRMATION */}
      {deletingPermitId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Building Permit?</h3>
              <p className="text-xs text-slate-500 mt-1">This action will permanently delete this building permit record from the council ledger.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingPermitId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermitConfirm}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
