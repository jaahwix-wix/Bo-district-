import React from 'react';
import { TabType } from '../types';
import { Building2, PhoneCall, MapPin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 mt-12 py-10">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: District Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 border border-amber-400/40 flex items-center justify-center font-bold text-xs text-amber-400">
                BDC
              </div>
              <span className="font-bold text-white text-base">Bo District Council</span>
            </div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              Official Local Government Gateway serving all 15 Chiefdoms across the Southern Province of Sierra Leone under the Local Government Act.
            </p>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Service • Equity • Community Development
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">Digital Services</div>
            <ul className="space-y-1.5 text-emerald-200">
              <li>
                <button onClick={() => setActiveTab('report')} className="hover:text-amber-400 transition-colors">
                  Report Infrastructure Issue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tax')} className="hover:text-amber-400 transition-colors">
                  Property Rate Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('chiefdoms')} className="hover:text-amber-400 transition-colors">
                  Chiefdom & Ward Directory
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('projects')} className="hover:text-amber-400 transition-colors">
                  Bo DevTracker (Projects)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('assistant')} className="hover:text-amber-400 transition-colors">
                  Bo Civic Assistant (AI)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Offices */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">District Secretariat</div>
            <div className="text-emerald-200 space-y-1">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Bo District Council Hall, Fenton Road / Njala Dockyard Area, Bo City, Sierra Leone</span>
              </p>
              <p className="flex items-center gap-1.5 pt-1">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hotline: +232 76 600 300</span>
              </p>
            </div>
          </div>

          {/* Col 4: Emergency Contacts */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-1">National Emergency Lines</div>
            <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-800 space-y-1 font-mono text-[11px]">
              <div>• Health / Cholera Response: <strong className="text-amber-300">117</strong></div>
              <div>• Sierra Leone Police: <strong className="text-amber-300">112</strong></div>
              <div>• Fire Brigade: <strong className="text-amber-300">019</strong></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-400/80 gap-2">
          <div>
            © {new Date().getFullYear()} Bo District Council • Republic of Sierra Leone. All rights reserved.
          </div>
          <div>
            Local Government Act 2004 / 2022 Compliance Gateway
          </div>
        </div>
      </div>
    </footer>
  );
};
