import React, { useState } from 'react';
import { DevelopmentProject, SectorType } from '../types';
import { D3DistrictMap } from './D3DistrictMap';
import { DevWardDataVisualization, getProjectWard } from './DevWardDataVisualization';
import { 
  Briefcase, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building, 
  DollarSign, 
  Calendar, 
  User, 
  MessageSquare,
  Send,
  Droplet,
  Truck,
  HeartPulse,
  GraduationCap,
  Sprout,
  Zap,
  Filter,
  X
} from 'lucide-react';

interface DevTrackerProps {
  projects: DevelopmentProject[];
  onAddFeedback?: (projectId: string, feedback: string) => void;
}

export const DevTracker: React.FC<DevTrackerProps> = ({ projects }) => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedMapProject, setSelectedMapProject] = useState<DevelopmentProject | null>(null);
  const [activeFeedbackProjectId, setActiveFeedbackProjectId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sectorIcons: Record<SectorType, React.ReactNode> = {
    Infrastructure: <Truck className="w-4 h-4 text-amber-600" />,
    'Water & Sanitation': <Droplet className="w-4 h-4 text-blue-600" />,
    Health: <HeartPulse className="w-4 h-4 text-rose-600" />,
    Education: <GraduationCap className="w-4 h-4 text-purple-600" />,
    Agriculture: <Sprout className="w-4 h-4 text-emerald-600" />,
    Energy: <Zap className="w-4 h-4 text-yellow-600" />,
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSector = selectedSector === 'all' || p.sector === selectedSector;
    const matchesWard = !selectedWard || getProjectWard(p) === selectedWard;
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.chiefdom.toLowerCase().includes(search.toLowerCase()) ||
      getProjectWard(p).toLowerCase().includes(search.toLowerCase()) ||
      p.contractor.toLowerCase().includes(search.toLowerCase());
    return matchesSector && matchesWard && matchesSearch;
  });

  const handleFeedbackSubmit = (e: React.FormEvent, projId: string) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setActiveFeedbackProjectId(null);
      setFeedbackText('');
    }, 2000);
  };

  const totalBudgetNLe = projects.reduce((acc, p) => acc + (p.budgetNLe || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800 font-bold">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              Bo DevTracker • District Development & Transparency
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Monitor infrastructure roads, solar water installations, market construction, and health post upgrades funded across Bo District.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 text-right">
          <div className="text-xs font-bold uppercase text-slate-400">Total Tracked Investment</div>
          <div className="text-lg font-black text-emerald-900 font-mono">
            NLe {(totalBudgetNLe || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recharts Ward Data Visualizations Section */}
      <DevWardDataVisualization 
        projects={projects}
        selectedWard={selectedWard}
        onSelectWard={(ward) => setSelectedWard(ward)}
      />

      {/* D3 Map Visualization */}
      <D3DistrictMap 
        projects={projects} 
        onSelectProject={(proj) => {
          setSelectedMapProject(proj);
          setSearch(proj.title);
        }}
        selectedProject={selectedMapProject} 
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Sector Tabs & Ward Filter Pill */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['all', 'Infrastructure', 'Water & Sanitation', 'Health', 'Education', 'Agriculture', 'Energy'].map((sector) => {
            const isSelected = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                id={`dev-sector-filter-${sector.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {sector === 'all' ? 'All Sectors' : sector}
              </button>
            );
          })}

          {selectedWard && (
            <div className="flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap border border-emerald-300">
              <span>{selectedWard}</span>
              <button 
                onClick={() => setSelectedWard(null)} 
                className="hover:text-red-700 ml-1 p-0.5 rounded-full"
                title="Clear ward filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search project, ward, or chiefdom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            id="dev-search-input"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
          >
            {/* Header / Badges */}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-100">
                  {sectorIcons[project.sector]}
                </span>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{project.sector}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-900">{project.chiefdom} Chiefdom</span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {getProjectWard(project)}
                    </span>
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                project.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : project.status === 'Near Completion'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {project.status}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{project.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {project.impactSummary}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Execution Progress</span>
                <span className="font-mono text-emerald-800">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Budget & Partner Info */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Allocated Budget</span>
                <span className="font-mono font-bold text-slate-900">NLe {(project.budgetNLe || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Funding Source</span>
                <span className="font-semibold text-slate-800 line-clamp-1">{project.fundingSource}</span>
              </div>
              <div className="pt-1 border-t border-slate-200/60 col-span-2 flex justify-between text-[11px] text-slate-500">
                <span>Contractor: <strong className="text-slate-800">{project.contractor}</strong></span>
                <span>Target: <strong className="text-slate-800 font-mono">{project.targetCompletion}</strong></span>
              </div>
            </div>

            {/* Feedback Toggle / Form */}
            <div className="pt-2">
              {activeFeedbackProjectId === project.id ? (
                <form onSubmit={(e) => handleFeedbackSubmit(e, project.id)} className="space-y-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Community Project Feedback</span>
                    <button
                      type="button"
                      onClick={() => setActiveFeedbackProjectId(null)}
                      className="text-slate-400 hover:text-slate-600 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                  {feedbackSent ? (
                    <p className="text-xs text-emerald-800 font-bold py-1">
                      ✓ Feedback recorded! Thank you for helping Council monitor local projects.
                    </p>
                  ) : (
                    <>
                      <textarea
                        required
                        rows={2}
                        placeholder="Comment on project quality, construction pace, or site observation..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      ></textarea>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-800 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Send Feedback
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setActiveFeedbackProjectId(project.id)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
                  id={`dev-feedback-btn-${project.id}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Submit Community Observation / Comment
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
