import React, { useState } from 'react';
import { Citizen } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  Filter, 
  CheckCircle2, 
  FileText,
  UserCheck
} from 'lucide-react';

interface CitizenManagementProps {
  citizens: Citizen[];
  onAddCitizen: (citizen: Citizen) => void;
}

export const CitizenManagement: React.FC<CitizenManagementProps> = ({
  citizens,
  onAddCitizen
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChiefdom, setSelectedChiefdom] = useState('all');
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [chiefdom, setChiefdom] = useState(CHIEFDOMS_DATA[0].name);
  const [ward, setWard] = useState('Ward 280');
  const [community, setCommunity] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('1990-01-01');
  const [idType, setIdType] = useState('National ID Card');
  const [nin, setNin] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Selected Citizen for Profile View
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(citizens[0] || null);

  const filteredCitizens = citizens.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChiefdom = selectedChiefdom === 'all' || c.chiefdom === selectedChiefdom;
    return matchesSearch && matchesChiefdom;
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const res = await fetch('/api/citizens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          ward,
          chiefdom,
          community,
          gender,
          dob,
          idType,
          nin
        })
      });

      if (res.ok) {
        const newCitizen = await res.json();
        onAddCitizen(newCitizen);
        setSelectedCitizen(newCitizen);
        setRegisterSuccess(true);
        setTimeout(() => {
          setRegisterSuccess(false);
          setActiveTab('directory');
        }, 2000);

        // Reset form
        setName('');
        setPhone('');
        setAddress('');
        setNin('');
        setCommunity('');
      }
    } catch (err) {
      console.error('Failed to register citizen:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2 border border-amber-500/30">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            Bo District Council • Citizen Records Gateway
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">
            Citizen Management & Identification Registry
          </h1>
          <p className="text-xs md:text-sm text-emerald-200 mt-1">
            Maintain verified resident records, National Identification Numbers (NIN), ward designations, and service history.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 bg-emerald-900 p-1.5 rounded-xl border border-emerald-800 shrink-0">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Citizen Directory ({citizens.length})
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register New Citizen
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search & Citizen List (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, NIN, or Citizen ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <select
                value={selectedChiefdom}
                onChange={(e) => setSelectedChiefdom(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Chiefdoms</option>
                {CHIEFDOMS_DATA.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredCitizens.map((c) => {
                const isSelected = selectedCitizen?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCitizen(c)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {c.id} • {c.phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {c.ward}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{c.chiefdom}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCitizens.length === 0 && (
                <div className="text-center text-slate-400 py-10 text-xs">
                  No registered citizen matched search criteria.
                </div>
              )}
            </div>
          </div>

          {/* Citizen Profile Card (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {selectedCitizen ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-400 font-black text-xl flex items-center justify-center border border-emerald-700 shadow-sm">
                    {selectedCitizen.name.charAt(0)}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                      Verified Citizen Record
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{selectedCitizen.name}</h2>
                    <span className="font-mono text-xs font-bold text-slate-500">{selectedCitizen.id}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" /> NIN / National Identification:
                      </span>
                      <span className="font-mono font-bold text-slate-900">{selectedCitizen.nin}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Contact:
                      </span>
                      <span className="font-mono font-bold text-slate-900">{selectedCitizen.phone}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" /> Chiefdom & Ward:
                      </span>
                      <span className="font-bold text-slate-900">{selectedCitizen.chiefdom} ({selectedCitizen.ward})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" /> Date of Birth / Gender:
                      </span>
                      <span className="font-bold text-slate-900">{selectedCitizen.dob} • {selectedCitizen.gender}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                    <div className="font-bold text-amber-900 text-[11px] mb-1">Residential Address:</div>
                    <p className="text-amber-950 font-medium">{selectedCitizen.address}, {selectedCitizen.community}, {selectedCitizen.chiefdom}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-bold text-slate-800 text-xs mb-2">Council Service History:</div>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded bg-slate-50 text-[11px] flex justify-between">
                        <span>Business Trade Licence (Active)</span>
                        <span className="font-mono text-emerald-700 font-bold">Paid Le 1,500</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 text-[11px] flex justify-between">
                        <span>Property Rate 2026 Assessment</span>
                        <span className="font-mono text-emerald-700 font-bold">Paid Le 850</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12 text-xs">Select a citizen from the directory to inspect profile.</div>
            )}
          </div>
        </div>
      ) : (
        /* Register Form */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            Register Citizen with Bo District Council Registry
          </h2>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mariama Kamara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+232 76 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">National ID Number (NIN)</label>
                <input
                  type="text"
                  placeholder="SL-NIN-XXXXXXX"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID Document Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="National ID Card">National ID Card</option>
                  <option value="Voter ID">Voter Registration ID</option>
                  <option value="Driver License">Driver's License</option>
                  <option value="Passport">Passport</option>
                </select>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Ward Number</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 280"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Community / Town Settlement</label>
              <input
                type="text"
                placeholder="e.g. Baoma Station Market Area"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. 14 Fenton Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            {registerSuccess && (
              <div className="bg-emerald-100 text-emerald-900 p-3.5 rounded-xl border border-emerald-300 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Citizen record successfully registered in Council DB! Redirecting...
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Complete Citizen Registration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
