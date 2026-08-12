import React, { useState, useEffect } from 'react';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { ChiefdomInfo, TabType } from '../types';
import { 
  MapPin, 
  UserCheck, 
  Building2, 
  Users, 
  Briefcase, 
  HeartPulse, 
  GraduationCap, 
  Search, 
  ArrowRight, 
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  X
} from 'lucide-react';

interface ChiefdomDirectoryProps {
  chiefdoms?: ChiefdomInfo[];
  setActiveTab: (tab: TabType) => void;
  onSelectChiefdomForReport?: (chiefdomName: string) => void;
  onAddChiefdom?: (chiefdom: ChiefdomInfo) => void;
  onUpdateChiefdom?: (chiefdom: ChiefdomInfo) => void;
  onDeleteChiefdom?: (chiefdomId: string) => void;
}

export const ChiefdomDirectory: React.FC<ChiefdomDirectoryProps> = ({
  chiefdoms = CHIEFDOMS_DATA,
  setActiveTab,
  onSelectChiefdomForReport,
  onAddChiefdom,
  onUpdateChiefdom,
  onDeleteChiefdom
}) => {
  const [search, setSearch] = useState('');
  const [selectedChiefdom, setSelectedChiefdom] = useState<ChiefdomInfo | null>(null);

  // Sync selected chiefdom
  useEffect(() => {
    if (chiefdoms && chiefdoms.length > 0) {
      if (!selectedChiefdom || !chiefdoms.some(c => c.id === selectedChiefdom.id)) {
        setSelectedChiefdom(chiefdoms[0]);
      } else {
        const updated = chiefdoms.find(c => c.id === selectedChiefdom.id);
        if (updated) setSelectedChiefdom(updated);
      }
    }
  }, [chiefdoms]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChiefdom, setEditingChiefdom] = useState<ChiefdomInfo | null>(null);
  const [deletingChiefdomId, setDeletingChiefdomId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    capital: '',
    paramountChief: '',
    councillor: '',
    wardsInput: '',
    populationEst: '50,000',
    activeProjectsCount: 0,
    healthCentersCount: 0,
    schoolsCount: 0,
    primaryEconomicActivity: '',
    councilOfficeLocation: '',
    description: ''
  });

  const filteredChiefdoms = chiefdoms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.capital.toLowerCase().includes(search.toLowerCase()) ||
    c.paramountChief.toLowerCase().includes(search.toLowerCase()) ||
    c.primaryEconomicActivity.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({
      name: '',
      capital: '',
      paramountChief: '',
      councillor: '',
      wardsInput: 'Ward 280, Ward 281',
      populationEst: '50,000',
      activeProjectsCount: 3,
      healthCentersCount: 2,
      schoolsCount: 10,
      primaryEconomicActivity: 'Agriculture & Rice Farming',
      councilOfficeLocation: 'Chiefdom Revenue Post',
      description: 'Chiefdom in Bo District with vibrant local farming communities.'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: ChiefdomInfo) => {
    setEditingChiefdom(c);
    setFormData({
      name: c.name,
      capital: c.capital,
      paramountChief: c.paramountChief,
      councillor: c.councillor,
      wardsInput: Array.isArray(c.wards) ? c.wards.join(', ') : c.wards,
      populationEst: c.populationEst || '50,000',
      activeProjectsCount: c.activeProjectsCount || 0,
      healthCentersCount: c.healthCentersCount || 0,
      schoolsCount: c.schoolsCount || 0,
      primaryEconomicActivity: c.primaryEconomicActivity || '',
      councilOfficeLocation: c.councilOfficeLocation || '',
      description: c.description || ''
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.capital) return;

    const wardsArr = formData.wardsInput.split(',').map(w => w.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/chiefdoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          capital: formData.capital,
          paramountChief: formData.paramountChief,
          councillor: formData.councillor,
          wards: wardsArr,
          populationEst: formData.populationEst,
          activeProjectsCount: Number(formData.activeProjectsCount),
          healthCentersCount: Number(formData.healthCentersCount),
          schoolsCount: Number(formData.schoolsCount),
          primaryEconomicActivity: formData.primaryEconomicActivity,
          councilOfficeLocation: formData.councilOfficeLocation,
          description: formData.description
        })
      });

      if (res.ok) {
        const created = await res.json();
        if (onAddChiefdom) onAddChiefdom(created);
        setSelectedChiefdom(created);
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create chiefdom:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChiefdom) return;

    const wardsArr = formData.wardsInput.split(',').map(w => w.trim()).filter(Boolean);

    try {
      const res = await fetch(`/api/chiefdoms/${editingChiefdom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          capital: formData.capital,
          paramountChief: formData.paramountChief,
          councillor: formData.councillor,
          wards: wardsArr,
          populationEst: formData.populationEst,
          activeProjectsCount: Number(formData.activeProjectsCount),
          healthCentersCount: Number(formData.healthCentersCount),
          schoolsCount: Number(formData.schoolsCount),
          primaryEconomicActivity: formData.primaryEconomicActivity,
          councilOfficeLocation: formData.councilOfficeLocation,
          description: formData.description
        })
      });

      if (res.ok) {
        const updated = await res.json();
        if (onUpdateChiefdom) onUpdateChiefdom(updated);
        setSelectedChiefdom(updated);
        setEditingChiefdom(null);
      }
    } catch (err) {
      console.error('Failed to update chiefdom:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChiefdomId) return;

    try {
      const res = await fetch(`/api/chiefdoms/${deletingChiefdomId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (onDeleteChiefdom) onDeleteChiefdom(deletingChiefdomId);
        setDeletingChiefdomId(null);
      }
    } catch (err) {
      console.error('Failed to delete chiefdom:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800 font-bold">
              <MapPin className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Chiefdoms & Council Wards Directory
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Explore and manage local governance, paramount chiefs, ward boundaries, health centers, and community details across Bo District.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search chiefdom or chief..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              id="chiefdom-search-input"
            />
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Chiefdom & Wards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chiefdom List (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            District Chiefdoms Directory ({filteredChiefdoms.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredChiefdoms.map((chiefdom) => {
              const isSelected = selectedChiefdom?.id === chiefdom.id;
              return (
                <div
                  key={chiefdom.id}
                  onClick={() => setSelectedChiefdom(chiefdom)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      {chiefdom.name}
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      Capital: <strong>{chiefdom.capital}</strong> • Wards: {Array.isArray(chiefdom.wards) ? chiefdom.wards.join(', ') : chiefdom.wards}
                    </p>
                  </div>

                  <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Chiefdom Detail Card (Right Column) */}
        <div className="lg:col-span-7">
          {selectedChiefdom ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-20">
              {/* Header Badge & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Chiefdom Authority Profile
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{selectedChiefdom.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">District Headquarters Capital: {selectedChiefdom.capital}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedChiefdom)}
                    className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1"
                    title="Edit Chiefdom Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeletingChiefdomId(selectedChiefdom.id)}
                    className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1"
                    title="Delete Chiefdom Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectChiefdomForReport) {
                        onSelectChiefdomForReport(selectedChiefdom.name);
                      }
                      setActiveTab('report');
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                    id={`chiefdom-report-issue-${selectedChiefdom.id}`}
                  >
                    Report Issue
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Leadership & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Paramount Chief</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    {selectedChiefdom.paramountChief}
                  </div>
                  <div className="text-xs text-slate-500">Chiefdom Traditional Court Barry</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Ward Councillor Representation</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    {selectedChiefdom.councillor}
                  </div>
                  <div className="text-xs text-slate-500">Bo District Council Elected Member</div>
                </div>
              </div>

              {/* Chiefdom Overview Narrative */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Chiefdom Profile & Governance</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
                  {selectedChiefdom.description}
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-lg font-black text-emerald-900">{selectedChiefdom.populationEst}</div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Est. Population</div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-lg font-black text-amber-900">{selectedChiefdom.activeProjectsCount}</div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Active Dev Projects</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-lg font-black text-blue-900">{selectedChiefdom.healthCentersCount}</div>
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Clinics / PHUs</div>
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="text-lg font-black text-purple-900">{selectedChiefdom.schoolsCount}</div>
                  <div className="text-[10px] font-bold text-purple-700 uppercase">Schools Assisted</div>
                </div>
              </div>

              {/* Wards & Economic Activity */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">District Wards Covered:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedChiefdom.wards) ? selectedChiefdom.wards : [selectedChiefdom.wards]).map(ward => (
                      <span key={ward} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-mono font-bold border border-slate-200">
                        {ward}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Primary Local Economy:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {selectedChiefdom.primaryEconomicActivity}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Council Revenue Station:</span>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    {selectedChiefdom.councilOfficeLocation}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select a chiefdom from the list to view local government details.
            </div>
          )}
        </div>
      </div>

      {/* ADD CHIEFDOM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Chiefdom & Wards</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kakua"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capital *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bo City"
                    value={formData.capital}
                    onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paramount Chief</label>
                <input
                  type="text"
                  placeholder="e.g. P.C. Prince Lapia Boima IV"
                  value={formData.paramountChief}
                  onChange={(e) => setFormData({ ...formData, paramountChief: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Elected Councillor</label>
                <input
                  type="text"
                  placeholder="e.g. Hon. Councillor Joseph Amara"
                  value={formData.councillor}
                  onChange={(e) => setFormData({ ...formData, councillor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Council Wards (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 280, Ward 281, Ward 282"
                  value={formData.wardsInput}
                  onChange={(e) => setFormData({ ...formData, wardsInput: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Population</label>
                  <input
                    type="text"
                    placeholder="e.g. 75,000"
                    value={formData.populationEst}
                    onChange={(e) => setFormData({ ...formData, populationEst: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Projects</label>
                  <input
                    type="number"
                    value={formData.activeProjectsCount}
                    onChange={(e) => setFormData({ ...formData, activeProjectsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Health Posts / Clinics</label>
                  <input
                    type="number"
                    value={formData.healthCentersCount}
                    onChange={(e) => setFormData({ ...formData, healthCentersCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assisted Schools</label>
                  <input
                    type="number"
                    value={formData.schoolsCount}
                    onChange={(e) => setFormData({ ...formData, schoolsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Economic Activity</label>
                <input
                  type="text"
                  placeholder="e.g. Mining, Agriculture & Trade"
                  value={formData.primaryEconomicActivity}
                  onChange={(e) => setFormData({ ...formData, primaryEconomicActivity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Council Revenue Station Location</label>
                <input
                  type="text"
                  placeholder="e.g. Chiefdom Headquarters Office"
                  value={formData.councilOfficeLocation}
                  onChange={(e) => setFormData({ ...formData, councilOfficeLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Create Chiefdom Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CHIEFDOM MODAL */}
      {editingChiefdom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Chiefdom & Wards</h3>
              <button onClick={() => setEditingChiefdom(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capital *</label>
                  <input
                    type="text"
                    required
                    value={formData.capital}
                    onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paramount Chief</label>
                <input
                  type="text"
                  value={formData.paramountChief}
                  onChange={(e) => setFormData({ ...formData, paramountChief: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Elected Councillor</label>
                <input
                  type="text"
                  value={formData.councillor}
                  onChange={(e) => setFormData({ ...formData, councillor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Council Wards (comma-separated)</label>
                <input
                  type="text"
                  value={formData.wardsInput}
                  onChange={(e) => setFormData({ ...formData, wardsInput: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Population</label>
                  <input
                    type="text"
                    value={formData.populationEst}
                    onChange={(e) => setFormData({ ...formData, populationEst: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Projects</label>
                  <input
                    type="number"
                    value={formData.activeProjectsCount}
                    onChange={(e) => setFormData({ ...formData, activeProjectsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Health Posts / Clinics</label>
                  <input
                    type="number"
                    value={formData.healthCentersCount}
                    onChange={(e) => setFormData({ ...formData, healthCentersCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assisted Schools</label>
                  <input
                    type="number"
                    value={formData.schoolsCount}
                    onChange={(e) => setFormData({ ...formData, schoolsCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Economic Activity</label>
                <input
                  type="text"
                  value={formData.primaryEconomicActivity}
                  onChange={(e) => setFormData({ ...formData, primaryEconomicActivity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Council Revenue Station Location</label>
                <input
                  type="text"
                  value={formData.councilOfficeLocation}
                  onChange={(e) => setFormData({ ...formData, councilOfficeLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chiefdom Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingChiefdom(null)}
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

      {/* DELETE CHIEFDOM CONFIRMATION */}
      {deletingChiefdomId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Chiefdom Record?</h3>
              <p className="text-xs text-slate-500 mt-1">This action will remove this chiefdom from the directory.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingChiefdomId(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
