import React from 'react';
import { TabType, ServiceReport, Announcement } from '../types';
import { CommunityPoll } from './CommunityPoll';
import { 
  FilePlus, 
  Search, 
  MapPin, 
  Calculator, 
  Briefcase, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Users, 
  Clock,
  Sparkles
} from 'lucide-react';

interface HeroBannerProps {
  setActiveTab: (tab: TabType) => void;
  reports: ServiceReport[];
  announcements: Announcement[];
  onSearchReport: (reportId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  setActiveTab,
  reports,
  announcements,
  onSearchReport
}) => {
  const [trackingInput, setTrackingInput] = React.useState('');
  const [searchFeedback, setSearchFeedback] = React.useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    
    const formatted = trackingInput.trim().toUpperCase();
    const found = reports.find(r => r.id.toUpperCase() === formatted);
    
    if (found) {
      setSearchFeedback('');
      onSearchReport(found.id);
      setActiveTab('report');
    } else {
      setSearchFeedback(`No report found matching ID "${trackingInput}". Try example: BDC-2026-101`);
    }
  };

  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const activeCount = reports.filter(r => r.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-800/80 p-6 md:p-8">
        {/* Subtle Background Pattern Accent */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Official Portal of Bo District Council • Sierra Leone
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Citizens, Building <span className="text-amber-400">Stronger Chiefdoms</span>
            </h1>

            <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed max-w-2xl">
              Access local government services digitally across all 15 chiefdoms of Bo District. Report public infrastructure issues, calculate local property rates, track development projects, and contact ward councillors.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('report')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm shadow-md transition-all flex items-center gap-2"
                id="hero-report-btn"
              >
                <FilePlus className="w-4 h-4" />
                Report a Service Issue
              </button>

              <button
                onClick={() => setActiveTab('tax')}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold text-sm border border-emerald-600/60 transition-all flex items-center gap-2"
                id="hero-tax-btn"
              >
                <Calculator className="w-4 h-4 text-amber-300" />
                Pay Taxes & Rates
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className="px-4 py-2.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 font-medium text-sm border border-emerald-700/80 transition-all flex items-center gap-2"
                id="hero-assistant-btn"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                Ask AI Assistant
              </button>
            </div>
          </div>

          {/* Right Card: Instant Report Tracking Box */}
          <div className="lg:col-span-5 bg-emerald-900/60 backdrop-blur-md rounded-xl p-5 border border-emerald-700/60 shadow-inner space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-bold">
              <Search className="w-4 h-4" />
              <span>Track Service Request Status</span>
            </div>
            <p className="text-xs text-emerald-200">
              Have a Tracking ID? Enter it below to check live inspection or repair updates from Council Officers.
            </p>

            <form onSubmit={handleTrackSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. BDC-2026-101"
                  value={trackingInput}
                  onChange={(e) => {
                    setTrackingInput(e.target.value);
                    if (searchFeedback) setSearchFeedback('');
                  }}
                  className="w-full bg-emerald-950/80 border border-emerald-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  id="hero-tracking-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-sm rounded-lg shrink-0 transition-colors"
                  id="hero-tracking-submit-btn"
                >
                  Track
                </button>
              </div>

              {searchFeedback && (
                <p className="text-xs text-amber-300 bg-amber-950/60 p-2 rounded border border-amber-500/30">
                  {searchFeedback}
                </p>
              )}

              <div className="text-[11px] text-emerald-300/80 pt-1 flex items-center justify-between">
                <span>Recent active sample: <code className="text-amber-300 font-mono">BDC-2026-101</code></span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingInput('BDC-2026-101');
                    onSearchReport('BDC-2026-101');
                    setActiveTab('report');
                  }}
                  className="underline text-emerald-200 hover:text-white"
                >
                  Try This
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Key District Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">15</div>
            <div className="text-xs font-medium text-slate-500">Chiefdoms Covered</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">NLe 4.8M</div>
            <div className="text-xs font-medium text-slate-500">Active Dev Projects</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{activeCount} Pending</div>
            <div className="text-xs font-medium text-slate-500">Active Service Logs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{resolvedCount} Resolved</div>
            <div className="text-xs font-medium text-slate-500">Citizen Issues Solved</div>
          </div>
        </div>
      </div>

      {/* Main Highlights Grid: Latest Notices & Featured Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Services Access */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-700" />
              Core Civic Services
            </h2>
            <span className="text-xs text-slate-500">Bo District Council Services</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveTab('report')}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <FilePlus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 flex items-center justify-between">
                Report Infrastructure Issue
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Log broken boreholes, feeder road washouts, health center light faults, or sanitation needs.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('tax')}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-800 flex items-center justify-between">
                Property & Business Tax
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Estimate property assessment rates, business licenses, and official bank / mobile payment channels.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('chiefdoms')}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-800 flex items-center justify-between">
                Chiefdom & Ward Finder
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Directory of Paramount Chiefs, Ward Councillors, health posts, and local revenue offices.
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('projects')}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-800 flex items-center justify-between">
                Bo DevTracker (Projects)
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Track transparent council spending, market construction, road rehabs, and donor-funded projects.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Latest Council Announcements */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Latest Council Notices
              </h2>
              <button 
                onClick={() => setActiveTab('notices')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => setActiveTab('notices')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] mb-1">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      ann.important 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-slate-400 font-mono">{ann.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {ann.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Bo District Council Secretariat • Fenton Road</span>
            <button 
              onClick={() => setActiveTab('notices')}
              className="font-semibold text-emerald-700 hover:underline"
            >
              Public Bylaws →
            </button>
          </div>
        </div>
      </div>

      {/* Community Priority Poll Section */}
      <CommunityPoll />
    </div>
  );
};
