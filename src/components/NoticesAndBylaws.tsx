import React, { useState } from 'react';
import { Announcement, CouncilEvent } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  Bell, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ChevronDown, 
  Scale,
  Plus,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  User,
  X,
  Filter,
  Building2,
  Sparkles
} from 'lucide-react';

interface NoticesAndBylawsProps {
  announcements: Announcement[];
  events: CouncilEvent[];
  onAddEvent: (event: CouncilEvent) => void;
  onEditEvent: (event: CouncilEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const NoticesAndBylaws: React.FC<NoticesAndBylawsProps> = ({ 
  announcements,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'bylaws'>('events');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(announcements[0]?.id || null);

  // Events filtering & search
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('All');
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('All');

  // Modal states for events
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CouncilEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Event Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CouncilEvent['category']>('Council Meeting');
  const [formDate, setFormDate] = useState(new Date().toISOString().substring(0, 10));
  const [formTime, setFormTime] = useState('10:00 AM - 1:00 PM');
  const [formLocation, setFormLocation] = useState('Bo District Council Hall, Fenton Road');
  const [formChiefdom, setFormChiefdom] = useState('Kakua');
  const [formOrganizer, setFormOrganizer] = useState('Office of the Council Chairman');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<CouncilEvent['status']>('Upcoming');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const districtBylaws = [
    {
      title: "Bo District Market Sanitation & Waste Management Bye-Law 2025",
      code: "BYE-2025-01",
      effectiveDate: "January 1, 2025",
      summary: "Mandates weekly cleaning of all chiefdom periodic market stalls (Tikonko, Baoma, Koribondo, Sumbuya). Market dues collectors are authorized to enforce sanitary skip container usage.",
      keyClauses: [
        "All food vendors must maintain covered trash bins.",
        "Weekly market clean-up mandatory every Wednesday 6:00 AM - 9:00 AM prior to market opening.",
        "Illegal dumping in drainage culverts carries NLe 500 spot fine."
      ]
    },
    {
      title: "Building Permit & Land Development Regulation",
      code: "BYE-2025-02",
      effectiveDate: "March 15, 2025",
      summary: "Requires all commercial and multi-family residential construction along highway corridors (Bo-Pujehun, Bo-Kenema, Bo-Taiama) to submit architectural drawings to Bo District Works Department.",
      keyClauses: [
        "Minimum 15-meter setback required from highway centerlines.",
        "Environmental impact assessment required for industrial or processing facilities.",
        "Building permits issued within 10 working days of fee payment."
      ]
    },
    {
      title: "Timber Harvest & Environmental Protection Dues",
      code: "BYE-2024-04",
      effectiveDate: "June 1, 2024",
      summary: "Regulates timber logging across Valunia, Boama, and Lugbu chiefdom forest reserves to prevent watershed erosion.",
      keyClauses: [
        "All timber haulage trucks must register at Council Checkpoints.",
        "Reforestation levy of NLe 150 charged per log truck transport.",
        "Unlicensed logging within 100 meters of public water boreholes strictly prohibited."
      ]
    }
  ];

  // Open Add Event Modal
  const openAddModal = () => {
    setFormTitle('');
    setFormCategory('Council Meeting');
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormTime('10:00 AM - 1:00 PM');
    setFormLocation('Bo District Council Hall, Fenton Road');
    setFormChiefdom('Kakua');
    setFormOrganizer('Office of the Council Chairman');
    setFormDescription('');
    setFormStatus('Upcoming');
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  // Open Edit Event Modal
  const openEditModal = (evt: CouncilEvent) => {
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category);
    setFormDate(evt.date);
    setFormTime(evt.time);
    setFormLocation(evt.location);
    setFormChiefdom(evt.chiefdom);
    setFormOrganizer(evt.organizer);
    setFormDescription(evt.description);
    setFormStatus(evt.status);
    setErrorMsg('');
  };

  // Submit Add Event
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLocation.trim()) {
      setErrorMsg('Please enter the event title and location.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          date: formDate,
          time: formTime,
          location: formLocation,
          chiefdom: formChiefdom,
          organizer: formOrganizer,
          description: formDescription,
          status: formStatus
        })
      });

      if (res.ok) {
        const created = await res.json();
        onAddEvent(created);
        setIsAddModalOpen(false);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Add event error:', err);
      setErrorMsg('Network error while creating event.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Event
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!formTitle.trim() || !formLocation.trim()) {
      setErrorMsg('Please enter the event title and location.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          date: formDate,
          time: formTime,
          location: formLocation,
          chiefdom: formChiefdom,
          organizer: formOrganizer,
          description: formDescription,
          status: formStatus
        })
      });

      if (res.ok) {
        const updated = await res.json();
        onEditEvent(updated);
        setEditingEvent(null);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Edit event error:', err);
      setErrorMsg('Network error while updating event.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Event
  const handleConfirmDelete = async () => {
    if (!deletingEventId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${deletingEventId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        onDeleteEvent(deletingEventId);
        setDeletingEventId(null);
      }
    } catch (err) {
      console.error('Delete event error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.chiefdom.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(eventSearchQuery.toLowerCase());

    const matchesCategory = eventCategoryFilter === 'All' || evt.category === eventCategoryFilter;
    const matchesStatus = eventStatusFilter === 'All' || evt.status === eventStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-800 font-bold">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              District Notices, Calendar & Bye-Laws
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Official council event schedules, public announcements, town hall meetings, and enforceable district ordinances.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="events-tab-btn"
          >
            <Calendar className="w-4 h-4" />
            Council Events ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'notices'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="notices-tab-btn"
          >
            <Bell className="w-4 h-4" />
            Public Notices ({announcements.length})
          </button>

          <button
            onClick={() => setActiveTab('bylaws')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bylaws'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="bylaws-tab-btn"
          >
            <Scale className="w-4 h-4" />
            District Bye-Laws
          </button>
        </div>
      </div>

      {/* EVENTS CALENDAR VIEW */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title, location, chiefdom, or keyword..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  id="event-search-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                  id="event-category-filter"
                >
                  <option value="All">All Categories</option>
                  <option value="Council Meeting">Council Meeting</option>
                  <option value="Town Hall">Town Hall</option>
                  <option value="Community Forum">Community Forum</option>
                  <option value="Public Hearing">Public Hearing</option>
                  <option value="Cultural Event">Cultural Event</option>
                  <option value="Health Drive">Health Drive</option>
                </select>

                <select
                  value={eventStatusFilter}
                  onChange={(e) => setEventStatusFilter(e.target.value)}
                  className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                  id="event-status-filter"
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
              id="add-event-btn"
            >
              <Plus className="w-4 h-4" />
              Schedule New Event
            </button>
          </div>

          {/* Event Cards Grid */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No matching council events found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search criteria or click "Schedule New Event" to post one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((evt) => {
                const getStatusBadge = (status: CouncilEvent['status']) => {
                  switch (status) {
                    case 'Upcoming':
                      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    case 'Ongoing':
                      return 'bg-amber-100 text-amber-800 border-amber-200';
                    case 'Completed':
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                    case 'Cancelled':
                      return 'bg-rose-100 text-rose-800 border-rose-200';
                    default:
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                            {evt.category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(evt.status)}`}>
                            {evt.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">{evt.id}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.title}</h3>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {evt.description}
                      </p>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                          <span>{evt.date}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                          <span>{evt.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{evt.location} ({evt.chiefdom} Chiefdom)</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Organizer: {evt.organizer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">Bo District Council Event</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                          id={`edit-event-btn-${evt.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingEventId(evt.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1 border border-rose-200"
                          id={`delete-event-btn-${evt.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PUBLIC NOTICES VIEW */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isExpanded = expandedNoticeId === ann.id;
            return (
              <div 
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      ann.important
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{ann.date}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-400">{ann.id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {ann.summary}
                </p>

                {isExpanded ? (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Full Announcement Text</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {ann.fullText}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Issued by: Office of the Chief Administrator • Bo District Council</span>
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800"
                      >
                        Print Notice
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedNoticeId(ann.id)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 pt-1"
                  >
                    Read Full Official Text
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BYE-LAWS VIEW */}
      {activeTab === 'bylaws' && (
        <div className="space-y-4">
          <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 text-xs space-y-2">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Legal Authority of Bo District Council Bye-Laws
            </h3>
            <p className="leading-relaxed text-emerald-100/90">
              Bye-laws enacted by the Bo District Council under Section 94 of the Sierra Leone Local Government Act carry full force of law within all 15 Chiefdoms. Paramount Chiefs and Local Courts assist Council Officers in enforcement.
            </p>
          </div>

          <div className="space-y-4">
            {districtBylaws.map((bylaw) => (
              <div 
                key={bylaw.code}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {bylaw.code}
                  </span>
                  <span className="text-xs text-slate-500">Enacted: {bylaw.effectiveDate}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{bylaw.title}</h3>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  {bylaw.summary}
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Key Enforceable Clauses</h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                    {bylaw.keyClauses.map((clause, idx) => (
                      <li key={idx} className="leading-relaxed">{clause}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Schedule New Council Event
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">Publish event details to the public Bo District portal</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boama Chiefdom Town Hall & Rate Review"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Council Meeting">Council Meeting</option>
                    <option value="Town Hall">Town Hall</option>
                    <option value="Community Forum">Community Forum</option>
                    <option value="Public Hearing">Public Hearing</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Health Drive">Health Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Chiefdom</label>
                  <select
                    value={formChiefdom}
                    onChange={(e) => setFormChiefdom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    {CHIEFDOMS_DATA.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="District-wide">District-wide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 1:00 PM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Location / Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="Bo District Council Hall, Fenton Road"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Organizer</label>
                  <input
                    type="text"
                    placeholder="Office of the Council Chairman"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed agenda or public invitation notice..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-400" />
                  Edit Event ({editingEvent.id})
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">Modify event schedule, location, or status</p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Council Meeting">Council Meeting</option>
                    <option value="Town Hall">Town Hall</option>
                    <option value="Community Forum">Community Forum</option>
                    <option value="Public Hearing">Public Hearing</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Health Drive">Health Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Chiefdom</label>
                  <select
                    value={formChiefdom}
                    onChange={(e) => setFormChiefdom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    {CHIEFDOMS_DATA.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="District-wide">District-wide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Time</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Location / Venue *</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Organizer</label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEventId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Council Event?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove event <strong className="font-mono text-slate-900">{deletingEventId}</strong>?
                This action will be permanently logged in the official Council Audit Trail.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEventId(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
