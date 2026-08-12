import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DevelopmentProject, SectorType } from '../types';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { MapPin, Info, Layers, CheckCircle2, Clock, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Filter } from 'lucide-react';

interface D3DistrictMapProps {
  projects: DevelopmentProject[];
  onSelectProject?: (project: DevelopmentProject) => void;
  selectedProject?: DevelopmentProject | null;
}

// Stylized geographical polygons & centroids for Bo District Chiefdoms (SVG viewBox 0 0 700 500)
interface ChiefdomGeo {
  id: string;
  name: string;
  centroid: [number, number];
  pathD: string;
  wards: string;
}

const CHIEFDOM_GEOMETRIES: ChiefdomGeo[] = [
  {
    id: "kakua",
    name: "Kakua Chiefdom",
    centroid: [320, 230],
    wards: "Wards 280-283",
    pathD: "M 270,180 L 370,170 L 390,230 L 360,280 L 280,270 L 260,220 Z"
  },
  {
    id: "tikonko",
    name: "Tikonko Chiefdom",
    centroid: [290, 320],
    wards: "Wards 284-286",
    pathD: "M 280,270 L 360,280 L 350,370 L 240,360 L 230,310 Z"
  },
  {
    id: "boama",
    name: "Boama Chiefdom",
    centroid: [440, 220],
    wards: "Wards 287-289",
    pathD: "M 370,170 L 480,160 L 510,240 L 420,270 L 390,230 Z"
  },
  {
    id: "lugbu",
    name: "Lugbu Chiefdom",
    centroid: [180, 380],
    wards: "Wards 290-292",
    pathD: "M 130,310 L 230,310 L 240,360 L 210,440 L 110,430 L 100,360 Z"
  },
  {
    id: "jaiama-bongor",
    name: "Jaiama Bongor Chiefdom",
    centroid: [410, 330],
    wards: "Wards 293-294",
    pathD: "M 360,280 L 420,270 L 490,320 L 450,390 L 350,370 Z"
  },
  {
    id: "bumpe-gao",
    name: "Bumpe Gao Chiefdom",
    centroid: [180, 200],
    wards: "Wards 295-296",
    pathD: "M 130,140 L 230,130 L 270,180 L 230,250 L 130,240 Z"
  },
  {
    id: "valunia",
    name: "Valunia Chiefdom",
    centroid: [310, 80],
    wards: "Wards 297-298",
    pathD: "M 240,30 L 380,30 L 380,110 L 250,110 Z"
  },
  {
    id: "wonde",
    name: "Wonde Chiefdom",
    centroid: [510, 330],
    wards: "Ward 299",
    pathD: "M 490,320 L 570,300 L 580,370 L 450,390 Z"
  },
  {
    id: "badjia",
    name: "Badjia Chiefdom",
    centroid: [430, 110],
    wards: "Ward 275",
    pathD: "M 380,30 L 490,30 L 480,160 L 370,170 L 380,110 Z"
  },
  {
    id: "bagbo",
    name: "Bagbo Chiefdom",
    centroid: [110, 440],
    wards: "Ward 276",
    pathD: "M 60,380 L 110,430 L 160,480 L 60,470 Z"
  },
  {
    id: "komboya",
    name: "Komboya Chiefdom",
    centroid: [530, 200],
    wards: "Ward 277",
    pathD: "M 480,160 L 580,150 L 590,250 L 510,240 Z"
  },
  {
    id: "niawa-lenga",
    name: "Niawa Lenga Chiefdom",
    centroid: [530, 100],
    wards: "Ward 278",
    pathD: "M 490,30 L 590,30 L 580,150 L 480,160 Z"
  },
  {
    id: "selenga",
    name: "Selenga Chiefdom",
    centroid: [200, 80],
    wards: "Ward 279",
    pathD: "M 150,30 L 240,30 L 250,110 L 130,140 Z"
  },
  {
    id: "gbo",
    name: "Gbo Chiefdom",
    centroid: [130, 270],
    wards: "Ward 274",
    pathD: "M 80,220 L 130,240 L 130,310 L 80,300 Z"
  }
];

export const D3DistrictMap: React.FC<D3DistrictMapProps> = ({
  projects,
  onSelectProject,
  selectedProject
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('all');
  const [activeChiefdomHover, setActiveChiefdomHover] = useState<ChiefdomGeo | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    project: DevelopmentProject;
    x: number;
    y: number;
  } | null>(null);

  // Filter projects according to sector selection
  const visibleProjects = projects.filter(
    (p) => activeSectorFilter === 'all' || p.sector === activeSectorFilter
  );

  // Color helper according to sector or status
  const getStatusColor = (status: DevelopmentProject['status']) => {
    switch (status) {
      case 'Completed': return '#059669'; // Emerald-600
      case 'Near Completion': return '#0d9488'; // Teal-600
      case 'In Progress': return '#d97706'; // Amber-600
      case 'Planning': return '#2563eb'; // Blue-600
      default: return '#475569';
    }
  };

  const getSectorColor = (sector: SectorType) => {
    switch (sector) {
      case 'Infrastructure': return '#d97706'; // Amber
      case 'Water & Sanitation': return '#2563eb'; // Blue
      case 'Health': return '#e11d48'; // Rose
      case 'Education': return '#7c3aed'; // Purple
      case 'Agriculture': return '#059669'; // Emerald
      case 'Energy': return '#ca8a04'; // Yellow
      default: return '#0d9488';
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const width = 700;
    const height = 500;

    // Outer group for Zoom/Pan
    const g = svg.append('g').attr('class', 'map-root-group');

    // Setup D3 Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 1. Render Chiefdom Polygons (Base Map Layer)
    const chiefdomGroup = g.append('g').attr('class', 'chiefdoms-layer');

    chiefdomGroup
      .selectAll('path')
      .data(CHIEFDOM_GEOMETRIES)
      .enter()
      .append('path')
      .attr('d', (d) => d.pathD)
      .attr('fill', '#f1f5f9') // Slate-100 base
      .attr('stroke', '#cbd5e1') // Slate-300 border
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('class', 'transition-all duration-200 cursor-pointer')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .attr('fill', '#e2e8f0') // Slate-200
          .attr('stroke', '#047857') // Emerald-700
          .attr('stroke-width', 2.5);
        setActiveChiefdomHover(d);
      })
      .on('mouseout', function () {
        d3.select(this)
          .attr('fill', '#f1f5f9')
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1.5);
        setActiveChiefdomHover(null);
      });

    // 2. Render Chiefdom Text Labels
    const labelsGroup = g.append('g').attr('class', 'labels-layer');

    labelsGroup
      .selectAll('text')
      .data(CHIEFDOM_GEOMETRIES)
      .enter()
      .append('text')
      .attr('x', (d) => d.centroid[0])
      .attr('y', (d) => d.centroid[1] - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#475569') // Slate-600
      .style('pointer-events', 'none')
      .text((d) => d.name.replace(' Chiefdom', ''));

    labelsGroup
      .selectAll('.ward-subtext')
      .data(CHIEFDOM_GEOMETRIES)
      .enter()
      .append('text')
      .attr('x', (d) => d.centroid[0])
      .attr('y', (d) => d.centroid[1] + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', '500')
      .attr('fill', '#94a3b8')
      .style('pointer-events', 'none')
      .text((d) => d.wards);

    // 3. Render Project Markers & Pulse Animations
    const projectsGroup = g.append('g').attr('class', 'projects-layer');

    // Group projects by chiefdom name to compute radial offsets when multiple projects exist in same chiefdom
    const chiefdomProjectMap = new Map<string, DevelopmentProject[]>();
    visibleProjects.forEach((p) => {
      const key = p.chiefdom.toLowerCase();
      if (!chiefdomProjectMap.has(key)) chiefdomProjectMap.set(key, []);
      chiefdomProjectMap.get(key)!.push(p);
    });

    const projectNodesData: {
      project: DevelopmentProject;
      x: number;
      y: number;
    }[] = [];

    CHIEFDOM_GEOMETRIES.forEach((c) => {
      // Find matching projects for this chiefdom (e.g. "Kakua" matches "Kakua Chiefdom" or "Kakua")
      const matches = visibleProjects.filter(
        (p) => c.name.toLowerCase().includes(p.chiefdom.toLowerCase()) || p.chiefdom.toLowerCase().includes(c.id)
      );

      matches.forEach((p, index) => {
        // Calculate offset radius for multiple markers
        let offsetX = 0;
        let offsetY = 0;
        if (matches.length > 1) {
          const angle = (index * 2 * Math.PI) / matches.length;
          const radius = 18;
          offsetX = Math.cos(angle) * radius;
          offsetY = Math.sin(angle) * radius;
        }

        projectNodesData.push({
          project: p,
          x: c.centroid[0] + offsetX,
          y: c.centroid[1] + offsetY + 12
        });
      });
    });

    // Outer Pulsing Aura Circles for active projects
    projectsGroup
      .selectAll('.project-pulse')
      .data(projectNodesData)
      .enter()
      .append('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 12)
      .attr('fill', (d) => getSectorColor(d.project.sector))
      .attr('opacity', 0.25)
      .attr('class', 'animate-ping origin-center');

    // Interactive Project Marker Circles
    const nodeGroups = projectsGroup
      .selectAll('.project-node')
      .data(projectNodesData)
      .enter()
      .append('g')
      .attr('class', 'project-node cursor-pointer')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .on('mouseover', function (event, d) {
        d3.select(this).select('circle.main-node').attr('r', 10).attr('stroke-width', 3);
        
        // Calculate container relative coordinates for HTML tooltip
        if (containerRef.current) {
          const bounds = containerRef.current.getBoundingClientRect();
          setTooltipData({
            project: d.project,
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top - 10
          });
        }
      })
      .on('mouseout', function () {
        d3.select(this).select('circle.main-node').attr('r', 7).attr('stroke-width', 2);
        setTooltipData(null);
      })
      .on('click', function (event, d) {
        if (onSelectProject) {
          onSelectProject(d.project);
        }
      });

    // Node Circle Background
    nodeGroups
      .append('circle')
      .attr('class', 'main-node transition-all duration-150')
      .attr('r', (d) => (selectedProject?.id === d.project.id ? 10 : 7))
      .attr('fill', (d) => getStatusColor(d.project.status))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', (d) => (selectedProject?.id === d.project.id ? 3 : 2))
      .attr('shadow', '0 2px 4px rgba(0,0,0,0.2)');

    // Inner White Dot
    nodeGroups
      .append('circle')
      .attr('r', 2.5)
      .attr('fill', '#ffffff');

  }, [visibleProjects, selectedProject, activeSectorFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 relative overflow-hidden" ref={containerRef}>
      {/* Header & Sector Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Bo District Ward & Development Plotter (D3 Interactive Map)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any active project node to inspect budget allocation, contractor status, and ward progress.
          </p>
        </div>

        {/* Sector Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {['all', 'Infrastructure', 'Water & Sanitation', 'Health', 'Education'].map((sector) => {
            const isSelected = activeSectorFilter === sector;
            return (
              <button
                key={sector}
                onClick={() => setActiveSectorFilter(sector)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sector === 'all' ? 'All Sectors' : sector}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Map Canvas Container */}
      <div className="relative bg-slate-50/80 rounded-xl border border-slate-200 overflow-hidden min-h-[380px] flex items-center justify-center">
        {/* SVG Rendered by D3 */}
        <svg
          ref={svgRef}
          viewBox="0 0 700 500"
          className="w-full h-auto max-h-[460px] touch-pan-x touch-pan-y"
        ></svg>

        {/* Hovered Chiefdom Banner Overlay */}
        {activeChiefdomHover && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs shadow-md border border-slate-700 pointer-events-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold">{activeChiefdomHover.name}</span>
            <span className="text-slate-400 font-mono text-[10px]">({activeChiefdomHover.wards})</span>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-sm text-[10px] space-y-1">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[9px] mb-1">Status Legend</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span className="text-slate-700 font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-slate-700 font-medium">Near Completion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span className="text-slate-700 font-medium">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span className="text-slate-700 font-medium">Planning</span>
          </div>
        </div>

        {/* Floating HTML Tooltip */}
        {tooltipData && (
          <div
            className="absolute z-20 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs w-64 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
          >
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span>{tooltipData.project.sector}</span>
              <span className="font-mono text-white">{tooltipData.project.chiefdom}</span>
            </div>
            <h4 className="font-bold text-white text-xs leading-snug">{tooltipData.project.title}</h4>
            
            <div className="mt-2 space-y-1 border-t border-slate-800 pt-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Budget:</span>
                <span className="font-mono font-bold text-amber-300">NLe {(tooltipData.project.budgetNLe || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Progress:</span>
                <span className="font-bold text-emerald-400">{tooltipData.project.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contractor:</span>
                <span className="text-slate-200 line-clamp-1">{tooltipData.project.contractor}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Tip */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Interactive D3 visualization showing {visibleProjects.length} projects mapped across Bo District Chiefdoms.</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400">Scroll/Pinch to Zoom Map</span>
      </div>
    </div>
  );
};
