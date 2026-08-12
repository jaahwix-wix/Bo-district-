import React, { useState } from 'react';
import { ServiceReport, DevelopmentProject, Announcement, CouncilEvent } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PlusCircle, 
  Edit3, 
  Send, 
  Save, 
  AlertCircle, 
  Building,
  Bell,
  Briefcase,
  Calendar,
  Trash2,
  Plus,
  Pencil,
  X
} from 'lucide-react';

interface AdminPortalProps {
  reports: ServiceReport[];
  projects: DevelopmentProject[];
  announcements: Announcement[];
  events: CouncilEvent[];
  onUpdateReportStatus: (reportId: string, status: ServiceReport['status'], officialNote: string) => void;
  onAddProject: (project: DevelopmentProject) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onAddEvent: (event: CouncilEvent) => void;
  onEditEvent: (event: CouncilEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  reports,
  projects,
  announcements,
  events,
  onUpdateReportStatus,
  onAddProject,
  onAddAnnouncement,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'events' | 'addProject' | 'addNotice' | 'audit'>('reports');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => setAuditLogs(data))
      .catch(err => console.error('Failed to load audit logs:', err));
  }, [activeAdminTab]);

  // Report status update state
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [newStatus, setNewStatus] = useState<ServiceReport['status']>('Under Review');
  const [officialNote, setOfficialNote] = useState('');
  const [statusSaveSuccess, setStatusSaveSuccess] = useState(false);

  // New Project State
  const [projTitle, setProjTitle] = useState('');
  const [projSector, setProjSector] = useState<any>('Infrastructure');
  const [projChiefdom, setProjChiefdom] = useState(CHIEFDOMS_DATA[0].name);
  const [projBudget, setProjBudget] = useState('850000');
  const [projFunding, setProjFunding] = useState('Devolution Grant (GoSL)');
  const [projContractor, setProjContractor] = useState('Bo Heritage Builders');
  const [projImpact, setProjImpact] = useState('');

  // New Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<any>('Public Notice');
  const [noticeSummary, setNoticeSummary] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [noticeImportant, setNoticeImportant] = useState(false);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    try {
      const res = await fetch(`/api/reports/${selectedReportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          officialNote
        })
      });

      if (res.ok) {
        onUpdateReportStatus(selectedReportId, newStatus, officialNote);
        setStatusSaveSuccess(true);
        setTimeout(() => setStatusSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleNewProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projTitle,
          sector: projSector,
          chiefdom: projChiefdom,
          budgetNLe: Number(projBudget),
          fundingSource: projFunding,
          contractor: projContractor,
          impactSummary: projImpact
        })
      });

      if (res.ok) {
        const newProj = await res.json();
        onAddProject(newProj);
        setProjTitle('');
        setProjImpact('');
        alert('New infrastructure project added to public DevTracker!');
      }
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const handleNewNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle,
          category: noticeCategory,
          summary: noticeSummary,
          fullText: noticeText,
          important: noticeImportant
        })
      });

      if (res.ok) {
        const newAnn = await res.json();
        onAddAnnouncement(newAnn);
        setNoticeTitle('');
        setNoticeSummary('');
        setNoticeText('');
        alert('Public Council Notice published successfully!');
      }
    } catch (err) {
      console.error('Failed to publish notice:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-emerald-950 font-black">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">
              Bo District Council • Officer Portal
            </h1>
          </div>
          <p className="text-xs md:text-sm text-emerald-200 mt-1">
            Departmental Management Gateway for District Chairman, Chief Administrator, Works Engineers, and Valuation Officers.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-emerald-900 p-1.5 rounded-xl border border-emerald-800 shrink-0">
          <button
            onClick={() => setActiveAdminTab('reports')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'reports'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
            id="admin-tab-reports-btn"
          >
            <FileText className="w-4 h-4" />
            Manage Issue Reports
          </button>

          <button
            onClick={() => setActiveAdminTab('events')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'events'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
            id="admin-tab-events-btn"
          >
            <Calendar className="w-4 h-4" />
            Manage Events ({events.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('addProject')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'addProject'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
            id="admin-tab-add-project-btn"
          >
            <Briefcase className="w-4 h-4" />
            Add Dev Project
          </button>

          <button
            onClick={() => setActiveAdminTab('addNotice')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'addNotice'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
            id="admin-tab-add-notice-btn"
          >
            <Bell className="w-4 h-4" />
            Publish Notice
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeAdminTab === 'audit'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
            id="admin-tab-audit-btn"
          >
            <ShieldCheck className="w-4 h-4" />
            Audit Trail
          </button>
        </div>
      </div>

      {/* Admin Body Content */}
      {activeAdminTab === 'reports' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports Selector List (Left) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Submitted Service Queue ({reports.length})
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {reports.map((report) => {
                const isSelected = selectedReportId === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setNewStatus(report.status);
                      setOfficialNote(report.officialNote || '');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-emerald-900">{report.id}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {report.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{report.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {report.chiefdom} • {report.reporterName}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Editor (Right) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {selectedReport ? (
              <form onSubmit={handleUpdateStatusSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded border border-emerald-200">
                      {selectedReport.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedReport.title}</h2>
                    <p className="text-xs text-slate-500">
                      Chiefdom: {selectedReport.chiefdom} ({selectedReport.wardNumber}) • Location: {selectedReport.locationDetails}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700 uppercase text-[10px]">Citizen Report Description:</div>
                  <p className="text-slate-800 leading-relaxed">{selectedReport.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Submitted by: <strong>{selectedReport.reporterName}</strong> ({selectedReport.reporterPhone})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Update Inspection Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="admin-status-select"
                  >
                    <option value="Submitted">Submitted (Pending Review)</option>
                    <option value="Under Review">Under Review (Assigned to Department)</option>
                    <option value="Dispatched">Dispatched (Inspector / Works Team En Route)</option>
                    <option value="In Progress">In Progress (Active Repair Work)</option>
                    <option value="Resolved">Resolved (Completed & Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Council Note / Dispatch Action
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter details of dispatched engineer, replacement parts ordered, or estimated resolution timeline..."
                    value={officialNote}
                    onChange={(e) => setOfficialNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    id="admin-official-note-input"
                  ></textarea>
                </div>

                {statusSaveSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Status and official inspection note updated live on public portal!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                  id="admin-save-status-btn"
                >
                  <Save className="w-4 h-4" />
                  Save & Publish Status Update
                </button>
              </form>
            ) : (
              <div className="text-center text-slate-400 py-12">Select an issue report from the list to manage.</div>
            )}
          </div>
        </div>
      ) : activeAdminTab === 'addProject' ? (
        /* Add Project Form */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Register New Development Project on Bo DevTracker
          </h2>

          <form onSubmit={handleNewProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Solar Gravity Water Installation in Sumbuya"
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Development Sector</label>
                <select
                  value={projSector}
                  onChange={(e) => setProjSector(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Infrastructure">Infrastructure & Roads</option>
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Health">Public Health Clinics</option>
                  <option value="Education">Primary Education</option>
                  <option value="Agriculture">Agriculture & Markets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Chiefdom</label>
                <select
                  value={projChiefdom}
                  onChange={(e) => setProjChiefdom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  {CHIEFDOMS_DATA.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Allocated Budget (NLe)</label>
                <input
                  type="number"
                  value={projBudget}
                  onChange={(e) => setProjBudget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Funding Partner / Source</label>
                <input
                  type="text"
                  value={projFunding}
                  onChange={(e) => setProjFunding(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contractor / Agency</label>
              <input
                type="text"
                value={projContractor}
                onChange={(e) => setProjContractor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Community Impact Summary</label>
              <textarea
                rows={3}
                placeholder="Describe how many households or farmers will benefit..."
                value={projImpact}
                onChange={(e) => setProjImpact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Project to Public Portal
            </button>
          </form>
        </div>
      ) : activeAdminTab === 'events' ? (
        /* Events Management View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-800" />
                Bo District Council Events & Town Halls Registry
              </h2>
              <p className="text-xs text-slate-500">Manage statutory meetings, public consultative forums, and community health drives.</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold text-xs rounded-full self-start sm:self-auto">
              {events.length} Events Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Title & Category</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Venue & Chiefdom</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-bold text-emerald-800">{evt.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-xs">{evt.title}</div>
                      <div className="text-[11px] text-purple-800 font-medium">{evt.category} • {evt.organizer}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{evt.date}</div>
                      <div className="text-[11px] text-slate-500">{evt.time}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-medium">{evt.location}</div>
                      <div className="text-[11px] text-slate-500">{evt.chiefdom} Chiefdom</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === 'Upcoming' ? 'bg-emerald-100 text-emerald-800' :
                        evt.status === 'Ongoing' ? 'bg-amber-100 text-amber-800' :
                        evt.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          const newStatus = evt.status === 'Upcoming' ? 'Completed' : 'Upcoming';
                          try {
                            const res = await fetch(`/api/events/${evt.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) onEditEvent(await res.json());
                          } catch (err) {
                            console.error('Toggle status error:', err);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[11px]"
                        title="Toggle Status"
                      >
                        Toggle Status
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm(`Delete event ${evt.id}?`)) {
                            try {
                              const res = await fetch(`/api/events/${evt.id}`, { method: 'DELETE' });
                              if (res.ok) onDeleteEvent(evt.id);
                            } catch (err) {
                              console.error('Delete event error:', err);
                            }
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-bold text-[11px]"
                        title="Delete Event"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeAdminTab === 'addNotice' ? (
        /* Publish Notice Form */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Publish Official Bo District Council Public Notice
          </h2>

          <form onSubmit={handleNewNoticeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Announcement of Monthly Council Meeting Session"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="Public Notice">Public Notice</option>
                  <option value="Meeting">Council Meeting</option>
                  <option value="Tax Notice">Tax & Rate Assessment Notice</option>
                  <option value="Health Alert">Health & Disease Alert</option>
                  <option value="Tender">Contract Tender Call</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="notice-urgent-check"
                  checked={noticeImportant}
                  onChange={(e) => setNoticeImportant(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="notice-urgent-check" className="text-xs font-bold text-slate-700">
                  Mark as High Priority Banner
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary (Portal Banner)</label>
              <input
                type="text"
                placeholder="One sentence summary for front page display..."
                value={noticeSummary}
                onChange={(e) => setNoticeSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Official Announcement Body</label>
              <textarea
                rows={5}
                placeholder="Enter complete press release or council resolution text..."
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Publish Notice Live
            </button>
          </form>
        </div>
      ) : (
        /* Audit Trail View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official System Audit Trail Log</h2>
              <p className="text-xs text-slate-500">Immutable ledger recording officer transactions, payment approvals, and status changes.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-mono font-bold text-xs rounded-full">
              {auditLogs.length} Security Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Officer & Role</th>
                  <th className="p-3">Action Executed</th>
                  <th className="p-3">Target Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-emerald-800 font-bold">{log.id}</td>
                    <td className="p-3 text-slate-500">{log.timestamp}</td>
                    <td className="p-3">
                      <div className="font-sans font-bold text-slate-900">{log.user}</div>
                      <div className="text-[10px] text-slate-500">{log.role}</div>
                    </td>
                    <td className="p-3 font-sans text-slate-800 font-medium">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
