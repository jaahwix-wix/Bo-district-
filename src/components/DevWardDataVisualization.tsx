import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DevelopmentProject } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  Maximize2,
  Building,
  Target
} from 'lucide-react';

interface DevWardDataVisualizationProps {
  projects: DevelopmentProject[];
  selectedWard?: string | null;
  onSelectWard?: (ward: string | null) => void;
}

export const WARD_METADATA: Record<string, { chiefdom: string; area: string }> = {
  'Ward 280': { chiefdom: 'Kakua', area: 'Fenton Rd / Central Market' },
  'Ward 281': { chiefdom: 'Kakua', area: 'Korwama & Reservation' },
  'Ward 282': { chiefdom: 'Kakua', area: 'Njala Komboya corridor' },
  'Ward 283': { chiefdom: 'Kakua', area: 'Bo Outskirts & Mile 91 route' },
  'Ward 284': { chiefdom: 'Tikonko', area: 'Tikonko Town & Market' },
  'Ward 285': { chiefdom: 'Tikonko', area: 'Mogbdemo & Sebehun' },
  'Ward 286': { chiefdom: 'Tikonko', area: 'Mattru Road corridor' },
  'Ward 287': { chiefdom: 'Boama', area: 'Baoma Station & Feeder link' },
  'Ward 288': { chiefdom: 'Boama', area: 'Yamandu & Education belt' },
  'Ward 289': { chiefdom: 'Boama', area: 'Telu & Mogbuama' },
  'Ward 290': { chiefdom: 'Lugbu', area: 'Sumbuya Riverfront' },
  'Ward 291': { chiefdom: 'Lugbu', area: 'Mamboma Energy hub' },
  'Ward 292': { chiefdom: 'Lugbu', area: 'Saama Agricultural basin' },
  'Ward 293': { chiefdom: 'Jaiama Bongor', area: 'Koribondo Junction' },
  'Ward 294': { chiefdom: 'Jaiama Bongor', area: 'Telu Bongor' },
  'Ward 295': { chiefdom: 'Bumpe Gao', area: 'Bumpe Town Agro-center' },
  'Ward 296': { chiefdom: 'Bumpe Gao', area: 'Serabu & Mogbese' },
  'Ward 297': { chiefdom: 'Valunia', area: 'Mongere Mining & Clinic' },
  'Ward 298': { chiefdom: 'Valunia', area: 'Mano Feeder route' },
  'Ward 299': { chiefdom: 'Wonde', area: 'Gboyama Swamp Irrigation' },
};

export const getProjectWard = (project: DevelopmentProject): string => {
  if (project.ward && project.ward.trim()) return project.ward;
  const title = (project.title || '').toLowerCase();
  const chiefdom = (project.chiefdom || '').toLowerCase();

  if (chiefdom.includes('kakua')) {
    if (title.includes('korwama') || title.includes('maternity') || title.includes('281')) return 'Ward 281';
    if (title.includes('njala') || title.includes('komboya') || title.includes('282')) return 'Ward 282';
    if (title.includes('periphery') || title.includes('mile') || title.includes('283')) return 'Ward 283';
    return 'Ward 280';
  }
  if (chiefdom.includes('tikonko')) {
    if (title.includes('mogbdemo') || title.includes('sebehun') || title.includes('285')) return 'Ward 285';
    if (title.includes('mattru') || title.includes('286')) return 'Ward 286';
    return 'Ward 284';
  }
  if (chiefdom.includes('boama')) {
    if (title.includes('yamandu') || title.includes('school') || title.includes('288')) return 'Ward 288';
    if (title.includes('telu') || title.includes('289')) return 'Ward 289';
    return 'Ward 287';
  }
  if (chiefdom.includes('lugbu')) {
    if (title.includes('mamboma') || title.includes('grid') || title.includes('291')) return 'Ward 291';
    if (title.includes('saama') || title.includes('basin') || title.includes('292')) return 'Ward 292';
    return 'Ward 290';
  }
  if (chiefdom.includes('jaiama')) {
    if (title.includes('telu') || title.includes('kassama') || title.includes('294')) return 'Ward 294';
    return 'Ward 293';
  }
  if (chiefdom.includes('bumpe')) {
    if (title.includes('serabu') || title.includes('296')) return 'Ward 296';
    return 'Ward 295';
  }
  if (chiefdom.includes('valunia')) {
    if (title.includes('mano') || title.includes('298')) return 'Ward 298';
    return 'Ward 297';
  }
  if (chiefdom.includes('wonde')) {
    return 'Ward 299';
  }
  return 'Ward 280';
};

export const DevWardDataVisualization: React.FC<DevWardDataVisualizationProps> = ({
  projects,
  selectedWard,
  onSelectWard
}) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'completion' | 'sectors'>('budget');
  const [filterChiefdom, setFilterChiefdom] = useState<string>('all');

  // Aggregated data by ward
  const wardData = useMemo(() => {
    const map = new Map<string, {
      ward: string;
      chiefdom: string;
      area: string;
      totalBudget: number;
      projectCount: number;
      completedCount: number;
      nearCompletionCount: number;
      inProgressCount: number;
      planningCount: number;
      totalProgress: number;
      projects: DevelopmentProject[];
    }>();

    projects.forEach((proj) => {
      const ward = getProjectWard(proj);
      const meta = WARD_METADATA[ward] || { chiefdom: proj.chiefdom, area: proj.chiefdom };

      if (!map.has(ward)) {
        map.set(ward, {
          ward,
          chiefdom: meta.chiefdom,
          area: meta.area,
          totalBudget: 0,
          projectCount: 0,
          completedCount: 0,
          nearCompletionCount: 0,
          inProgressCount: 0,
          planningCount: 0,
          totalProgress: 0,
          projects: []
        });
      }

      const entry = map.get(ward)!;
      entry.totalBudget += proj.budgetNLe || 0;
      entry.projectCount += 1;
      entry.totalProgress += proj.progress || 0;
      entry.projects.push(proj);

      if (proj.status === 'Completed' || proj.progress === 100) {
        entry.completedCount += 1;
      } else if (proj.status === 'Near Completion' || proj.progress >= 75) {
        entry.nearCompletionCount += 1;
      } else if (proj.status === 'In Progress' || proj.progress >= 30) {
        entry.inProgressCount += 1;
      } else {
        entry.planningCount += 1;
      }
    });

    let result = Array.from(map.values()).map((item) => ({
      ...item,
      budgetNLe: item.totalBudget,
      budgetMillions: Number((item.totalBudget / 1_000_000).toFixed(2)),
      avgProgress: Math.round(item.totalProgress / Math.max(1, item.projectCount)),
      completionRate: Math.round(
        ((item.completedCount + item.nearCompletionCount * 0.75 + item.inProgressCount * 0.5) /
          Math.max(1, item.projectCount)) *
          100
      )
    }));

    if (filterChiefdom !== 'all') {
      result = result.filter((item) => item.chiefdom.toLowerCase() === filterChiefdom.toLowerCase());
    }

    // Sort by ward number
    return result.sort((a, b) => a.ward.localeCompare(b.ward, undefined, { numeric: true }));
  }, [projects, filterChiefdom]);

  // Sector breakdown data for Pie Chart
  const sectorData = useMemo(() => {
    const sMap = new Map<string, { name: string; budget: number; count: number }>();
    projects.forEach((p) => {
      const s = p.sector || 'Other';
      if (!sMap.has(s)) {
        sMap.set(s, { name: s, budget: 0, count: 0 });
      }
      const entry = sMap.get(s)!;
      entry.budget += p.budgetNLe || 0;
      entry.count += 1;
    });
    return Array.from(sMap.values());
  }, [projects]);

  // Overall metrics
  const totalTrackedBudget = useMemo(
    () => projects.reduce((acc, p) => acc + (p.budgetNLe || 0), 0),
    [projects]
  );

  const avgDistrictProgress = useMemo(() => {
    if (!projects.length) return 0;
    return Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length);
  }, [projects]);

  const topBudgetWard = useMemo(() => {
    if (!wardData.length) return null;
    return [...wardData].sort((a, b) => b.totalBudget - a.totalBudget)[0];
  }, [wardData]);

  const topCompletedWard = useMemo(() => {
    if (!wardData.length) return null;
    return [...wardData].sort((a, b) => b.avgProgress - a.avgProgress)[0];
  }, [wardData]);

  const chiefdomOptions = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      const meta = WARD_METADATA[getProjectWard(p)];
      set.add(meta ? meta.chiefdom : p.chiefdom);
    });
    return Array.from(set).sort();
  }, [projects]);

  const SECTOR_COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#eab308'];

  // Custom tooltips
  const CustomBudgetTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>{data.ward}</span>
            <span className="text-[10px] text-slate-300 font-normal">{data.chiefdom}</span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">{data.area}</div>
          <div className="pt-1 flex justify-between">
            <span className="text-slate-400">Total Budget:</span>
            <span className="font-mono font-bold text-white">NLe {(data.totalBudget || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Active Projects:</span>
            <span className="font-bold text-emerald-300">{data.projectCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Avg Progress:</span>
            <span className="font-bold text-amber-300">{data.avgProgress}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCompletionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-teal-400 border-b border-slate-700 pb-1 flex justify-between items-center">
            <span>{data.ward}</span>
            <span className="text-amber-400 font-mono font-bold">{data.avgProgress}% Avg</span>
          </div>
          <div className="text-[10px] text-slate-300">{data.chiefdom} • {data.area}</div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-400 flex items-center gap-1">● Completed:</span>
              <span className="font-bold">{data.completedCount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-teal-400 flex items-center gap-1">● Near Completion:</span>
              <span className="font-bold">{data.nearCompletionCount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-amber-400 flex items-center gap-1">● In Progress:</span>
              <span className="font-bold">{data.inProgressCount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-rose-400 flex items-center gap-1">● Planning:</span>
              <span className="font-bold">{data.planningCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Title & Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900">
                Ward Data Visualizations • Budget Allocation & Completion Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive Recharts analytics showcasing capital investments, progress metrics, and project execution across Bo District wards.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-center shrink-0">
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'budget'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-chart-budget"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Budget Allocation
          </button>
          <button
            onClick={() => setActiveTab('completion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'completion'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-chart-completion"
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            Completion Status
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sectors'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            id="tab-chart-sectors"
          >
            <PieChartIcon className="w-3.5 h-3.5 text-amber-600" />
            Sector Distribution
          </button>
        </div>
      </div>

      {/* Ward Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Budget Tracked</span>
          <div className="text-base md:text-lg font-black text-slate-900 font-mono mt-0.5">
            NLe {(totalTrackedBudget || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">{projects.length} Total Projects</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">District Average Progress</span>
          <div className="text-base md:text-lg font-black text-emerald-800 font-mono mt-0.5 flex items-center gap-1">
            <span>{avgDistrictProgress}%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
              {avgDistrictProgress >= 70 ? 'On Track' : 'In Execution'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Across {wardData.length} Wards</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Top Capital Ward</span>
          <div className="text-base md:text-lg font-black text-slate-900 mt-0.5 truncate">
            {topBudgetWard ? topBudgetWard.ward : 'N/A'}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">
            {topBudgetWard ? `NLe ${(topBudgetWard.totalBudget || 0).toLocaleString()}` : '0'}
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Completion Ward</span>
          <div className="text-base md:text-lg font-black text-slate-900 mt-0.5 truncate">
            {topCompletedWard ? topCompletedWard.ward : 'N/A'}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold font-mono">
            {topCompletedWard ? `${topCompletedWard.avgProgress}% Completed` : '0%'}
          </span>
        </div>
      </div>

      {/* Filter by Chiefdom & Ward Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filter Wards by Chiefdom:</span>
          <select
            value={filterChiefdom}
            onChange={(e) => setFilterChiefdom(e.target.value)}
            className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            id="chart-chiefdom-filter"
          >
            <option value="all">All Chiefdoms ({chiefdomOptions.length})</option>
            {chiefdomOptions.map((c) => (
              <option key={c} value={c}>{c} Chiefdom</option>
            ))}
          </select>
        </div>

        {selectedWard && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Selected: <strong className="text-emerald-900">{selectedWard}</strong></span>
            <button
              onClick={() => onSelectWard?.(null)}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-semibold text-slate-700"
            >
              Reset Selection
            </button>
          </div>
        )}
      </div>

      {/* Charts Area */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600">
            <div className="font-semibold text-slate-800">
              Allocated Budget (NLe Millions) & Total Projects by Ward
            </div>
            <div className="text-[11px] text-slate-500">
              Click any bar to inspect specific ward projects
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={wardData}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    onSelectWard?.(e.activePayload[0].payload.ward);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="ward"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#059669"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}M`}
                  label={{ value: 'Budget (NLe M)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#059669' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0284c7"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Projects', angle: 90, position: 'insideRight', fontSize: 10, fill: '#0284c7' }}
                />
                <Tooltip content={<CustomBudgetTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={(value) => <span className="text-slate-700 font-semibold">{value}</span>}
                />
                <Bar
                  yAxisId="left"
                  dataKey="budgetMillions"
                  name="Budget Allocation (NLe Millions)"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                >
                  {wardData.map((entry) => (
                    <Cell
                      key={`cell-${entry.ward}`}
                      fill={selectedWard === entry.ward ? '#065f46' : '#10b981'}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="projectCount"
                  name="Active Projects Count"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0284c7' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'completion' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600">
            <div className="font-semibold text-slate-800">
              Ward Project Completion Status & Progress Execution (%)
            </div>
            <div className="text-[11px] text-slate-500">
              Bars show project status distribution; Line shows average completion %
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={wardData}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    onSelectWard?.(e.activePayload[0].payload.ward);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="ward"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  yAxisId="count"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Project Count', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="progress"
                  orientation="right"
                  stroke="#059669"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  label={{ value: 'Progress %', angle: 90, position: 'insideRight', fontSize: 10, fill: '#059669' }}
                />
                <Tooltip content={<CustomCompletionTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={(value) => <span className="text-slate-700 font-semibold">{value}</span>}
                />
                <Bar
                  yAxisId="count"
                  dataKey="completedCount"
                  name="Completed"
                  stackId="status"
                  fill="#059669"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  yAxisId="count"
                  dataKey="nearCompletionCount"
                  name="Near Completion"
                  stackId="status"
                  fill="#0d9488"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  yAxisId="count"
                  dataKey="inProgressCount"
                  name="In Progress"
                  stackId="status"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  yAxisId="count"
                  dataKey="planningCount"
                  name="Planning"
                  stackId="status"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="progress"
                  type="monotone"
                  dataKey="avgProgress"
                  name="Average Progress %"
                  stroke="#047857"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#047857' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'sectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="budget"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`NLe ${Number(value).toLocaleString()}`, 'Allocated Budget']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Capital Budget by Sector
            </h4>
            <div className="space-y-2">
              {sectorData.map((sec, idx) => {
                const pct = totalTrackedBudget > 0 ? Math.round((sec.budget / totalTrackedBudget) * 100) : 0;
                return (
                  <div key={sec.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}
                        ></span>
                        {sec.name} ({sec.count} projects)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        NLe {sec.budget.toLocaleString()} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Ward Cards Table Grid */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Ward Performance Breakdown ({wardData.length} Wards Displayed)
          </span>
          <span className="text-[11px] text-slate-400">
            Source: Bo District Council Public DevTracker & Ministry of Finance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {wardData.map((item) => {
            const isSelected = selectedWard === item.ward;
            return (
              <button
                key={item.ward}
                onClick={() => onSelectWard?.(isSelected ? null : item.ward)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.ward}
                  </span>
                  <span className={`text-[10px] font-mono px-1 rounded ${
                    isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.avgProgress}%
                  </span>
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {item.chiefdom}
                </div>
                <div className={`text-[11px] font-mono font-bold mt-1 ${isSelected ? 'text-emerald-100' : 'text-emerald-800'}`}>
                  NLe {(item.totalBudget / 1000).toFixed(0)}k
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
