import React, { useState } from 'react';
import { ServiceReport, CategoryType, PriorityLevel } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  FilePlus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Send, 
  Copy, 
  Filter, 
  MapPin, 
  Phone, 
  User, 
  Info,
  Droplet,
  Truck,
  Trash2,
  HeartPulse,
  GraduationCap,
  Calculator,
  HelpCircle
} from 'lucide-react';

interface CivicReportProps {
  reports: ServiceReport[];
  onNewReport: (report: ServiceReport) => void;
  selectedReportId?: string;
}

export const CivicReport: React.FC<CivicReportProps> = ({
  reports,
  onNewReport,
  selectedReportId
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'submit' | 'list'>(selectedReportId ? 'list' : 'submit');
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('water');
  const [chiefdom, setChiefdom] = useState(CHIEFDOMS_DATA[0].name);
  const [wardNumber, setWardNumber] = useState('Ward 280');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<ServiceReport | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // List Filter State
  const [searchQuery, setSearchQuery] = useState(selectedReportId || '');
  const [filterChiefdom, setFilterChiefdom] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Update searchQuery if selectedReportId changes
  React.useEffect(() => {
    if (selectedReportId) {
      setSearchQuery(selectedReportId);
      setActiveSubTab('list');
    }
  }, [selectedReportId]);

  const categoryIcons: Record<CategoryType, React.ReactNode> = {
    water: <Droplet className="w-4 h-4 text-blue-600" />,
    roads: <Truck className="w-4 h-4 text-amber-600" />,
    sanitation: <Trash2 className="w-4 h-4 text-emerald-600" />,
    health: <HeartPulse className="w-4 h-4 text-rose-600" />,
    education: <GraduationCap className="w-4 h-4 text-purple-600" />,
    rates: <Calculator className="w-4 h-4 text-indigo-600" />,
    other: <HelpCircle className="w-4 h-4 text-slate-600" />,
  };

  const getStatusBadge = (status: ServiceReport['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Info className="w-3 h-3" /> Under Review</span>;
      case 'Dispatched':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Truck className="w-3 h-3" /> Inspector Dispatched</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1"><Clock className="w-3 h-3 animate-pulse" /> Repair In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Issue Resolved</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          chiefdom,
          wardNumber,
          locationDetails,
          description,
          reporterName,
          reporterPhone,
          priority
        }),
      });

      if (res.ok) {
        const newReport: ServiceReport = await res.json();
        onNewReport(newReport);
        setSubmittedReport(newReport);
        
        // Reset form
        setTitle('');
        setLocationDetails('');
        setDescription('');
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChiefdom = filterChiefdom === 'all' || report.chiefdom === filterChiefdom;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;

    return matchesSearch && matchesChiefdom && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <FilePlus className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              CivicIssue Reporter & Tracker
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Log water supply faults, road damage, market sanitation requests, or clinic power issues directly to Bo District Council Engineers.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab('submit');
              setSubmittedReport(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'submit'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="subtab-submit-issue-btn"
          >
            <FilePlus className="w-4 h-4" />
            Submit New Issue
          </button>

          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'list'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="subtab-tracker-list-btn"
          >
            <Search className="w-4 h-4" />
            Track Issues ({reports.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'submit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Container */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {submittedReport ? (
              /* Success Confirmation Box */
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-950">
                    Issue Successfully Submitted to Bo District Council!
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your request has been routed to the District Works & Utilities Department.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-md mx-auto space-y-2 text-left">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Your Official Tracking ID</div>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-base font-bold text-emerald-900">
                    <span>{submittedReport.id}</span>
                    <button
                      onClick={() => handleCopy(submittedReport.id)}
                      className="px-3 py-1 bg-emerald-800 text-white text-xs rounded font-sans hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId ? 'Copied!' : 'Copy ID'}
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 pt-1">
                    <strong>Chiefdom:</strong> {submittedReport.chiefdom} ({submittedReport.wardNumber})<br />
                    <strong>Title:</strong> {submittedReport.title}<br />
                    <strong>Status:</strong> {submittedReport.status}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setSubmittedReport(null)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Another Issue
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery(submittedReport.id);
                      setActiveSubTab('list');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
                  >
                    Track This Issue Live
                  </button>
                </div>
              </div>
            ) : (
              /* Report Submission Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  1. Issue Details & Category
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issue Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CategoryType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      id="report-category-select"
                    >
                      <option value="water">💧 Water & Boreholes</option>
                      <option value="roads">🚚 Feeder Roads & Culverts</option>
                      <option value="sanitation">🗑️ Market Waste & Sanitation</option>
                      <option value="health">🏥 Health Center & MCHP Repairs</option>
                      <option value="education">🏫 Primary School Infrastructure</option>
                      <option value="rates">💳 Property Rates & Fees Inquiry</option>
                      <option value="other">❓ Other Community Matter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Priority Urgency <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      id="report-priority-select"
                    >
                      <option value="Low">Low - Normal Routine Maintenance</option>
                      <option value="Medium">Medium - Standard Public Request</option>
                      <option value="High">High - Significant Community Disruption</option>
                      <option value="Urgent">Urgent - Emergency Health/Safety Risk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brief Issue Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken water pump handle at Tikonko Market Square"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="report-title-input"
                  />
                </div>

                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">
                  2. Chiefdom & Location Pin
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chiefdom <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={chiefdom}
                      onChange={(e) => {
                        setChiefdom(e.target.value);
                        const selected = CHIEFDOMS_DATA.find(c => c.name === e.target.value);
                        if (selected && selected.wards.length > 0) {
                          setWardNumber(selected.wards[0]);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      id="report-chiefdom-select"
                    >
                      {CHIEFDOMS_DATA.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.capital})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Council Ward
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ward 284"
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      id="report-ward-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Town / Village / Landmark Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100 meters behind Koribondo Motor Park, opposite primary school"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="report-location-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Issue Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what happened, how long the issue has persisted, and estimated number of affected households..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="report-description-input"
                  ></textarea>
                </div>

                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 pt-2">
                  3. Citizen Contact Info (For Officer Follow-up)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohamed Sankoh"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      id="report-reporter-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Orange / Africell)
                    </label>
                    <input
                      type="tel"
                      placeholder="+232 76 000 000"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                      id="report-reporter-phone-input"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    id="report-submit-form-btn"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting to District Council...' : 'Submit Official Service Report'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                Council Service Guarantee
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Bo District Council is committed to transparent governance under the Sierra Leone Local Government Act.
              </p>
              <ul className="text-xs text-emerald-200 space-y-2 border-t border-emerald-800/80 pt-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>24-48 Hours Review:</strong> Inspection assignment by District Works Engineer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Tracking Code:</strong> Unique SMS / digital ID generated for public tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Ward Councillor Copy:</strong> Automatic notification dispatched to local ward committee.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700" />
                Emergency Contact Hotline
              </h4>
              <p>For urgent life safety hazards or disaster relief assistance in Bo District:</p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono font-bold text-slate-900 space-y-1">
                <div>Council Emergency: +232 76 600 300</div>
                <div>Health / Cholera Hotline: 117</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Issue Tracker List View */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search ID / Title</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. BDC-2026-101 or Borehole"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  id="tracker-search-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter Chiefdom</label>
              <select
                value={filterChiefdom}
                onChange={(e) => setFilterChiefdom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                id="tracker-chiefdom-filter"
              >
                <option value="all">All Chiefdoms (15)</option>
                {CHIEFDOMS_DATA.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                id="tracker-status-filter"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filter Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                id="tracker-category-filter"
              >
                <option value="all">All Categories</option>
                <option value="water">Water & Boreholes</option>
                <option value="roads">Roads & Culverts</option>
                <option value="sanitation">Sanitation & Waste</option>
                <option value="health">Health Clinics</option>
                <option value="education">Schools</option>
              </select>
            </div>
          </div>

          {/* Results Count & Reset */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{filteredReports.length}</strong> service reports</span>
            {(searchQuery || filterChiefdom !== 'all' || filterStatus !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterChiefdom('all');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Reports Feed */}
          {filteredReports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Matching Service Reports Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Check your search tracking ID or reset filters to view all public service requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div 
                  key={report.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                    searchQuery && report.id.toLowerCase() === searchQuery.toLowerCase()
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {report.id}
                      </span>
                      <span className="p-1.5 rounded-lg bg-slate-100">
                        {categoryIcons[report.category]}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 capitalize">
                        {report.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        report.priority === 'Urgent' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : report.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {report.priority} Priority
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">{report.title}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {report.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Chiefdom & Ward</span>
                      <span className="font-semibold text-slate-800">{report.chiefdom} • {report.wardNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Exact Location</span>
                      <span className="text-slate-800">{report.locationDetails}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporter</span>
                      <span className="text-slate-800">{report.reporterName} ({report.reporterPhone})</span>
                    </div>
                  </div>

                  {/* Official Inspection Note */}
                  {report.officialNote && (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-emerald-900">District Council Official Update:</strong>
                        <p className="text-emerald-800 mt-0.5">{report.officialNote}</p>
                        <span className="text-[10px] text-emerald-600 font-mono block mt-1">Updated: {report.updatedAt}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
