import React, { useState, useEffect } from 'react';
import { CHIEFDOMS_DATA } from '../data/chiefdoms';
import { 
  Vote, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Send, 
  PlusCircle, 
  Award, 
  Users, 
  Building2, 
  Droplet, 
  Truck, 
  HeartPulse, 
  Sprout, 
  MessageSquare
} from 'lucide-react';

export interface PollOption {
  id: string;
  title: string;
  category: string;
  description: string;
  targetChiefdoms: string;
  votes: number;
  icon: React.ReactNode;
}

export const CommunityPoll: React.FC = () => {
  // Poll Options State
  const [options, setOptions] = useState<PollOption[]>([
    {
      id: 'opt-1',
      title: 'Solar Water Boreholes in Rural Schools & Primary Health Clinics',
      category: 'Water & Sanitation',
      description: 'Install deep solar-powered boreholes with 5,000L tanks in 20 primary schools and rural maternal clinics.',
      targetChiefdoms: 'Tikonko, Valunia, Bumpe Gao, Badjia',
      votes: 412,
      icon: <Droplet className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'opt-2',
      title: 'Feeder Road Grading & Concrete Culvert Armouring',
      category: 'Infrastructure',
      description: 'Rehabilitate high-priority agricultural feeder roads connecting farm settlements directly to Bo central markets.',
      targetChiefdoms: 'Kakua, Jaiama Bongor, Boama, Lugbu',
      votes: 358,
      icon: <Truck className="w-5 h-5 text-amber-600" />
    },
    {
      id: 'opt-3',
      title: 'Covered Market Lock-ups & Solar Cold Storage Kits',
      category: 'Local Economy',
      description: 'Construct modern covered produce stalls and solar refrigeration units for fish and vegetable traders.',
      targetChiefdoms: 'Sumbuya, Tikonko, Koribondo',
      votes: 289,
      icon: <Building2 className="w-5 h-5 text-purple-600" />
    },
    {
      id: 'opt-4',
      title: 'Mobile Maternal Clinic Ambulances & Solar Cold Chains',
      category: 'Public Health',
      description: 'Deploy 4x4 motor ambulance trikes and solar vaccine refrigerators to remote chiefdom health posts.',
      targetChiefdoms: 'Lugbu, Wonde, Selenga, Gbo',
      votes: 245,
      icon: <HeartPulse className="w-5 h-5 text-rose-600" />
    },
    {
      id: 'opt-5',
      title: 'Community Seed Banks & Cassava Milling Machinery Grants',
      category: 'Agriculture',
      description: 'Provide motorized cassava gari processing machines and high-yield rice seed banks to women farmer co-ops.',
      targetChiefdoms: 'Bumpe Gao, Bagbo, Komboya, Niawa Lenga',
      votes: 198,
      icon: <Sprout className="w-5 h-5 text-emerald-600" />
    }
  ]);

  // User Voting State
  const [selectedChiefdom, setSelectedChiefdom] = useState<string>(CHIEFDOMS_DATA[0].name);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votedOptionTitle, setVotedOptionTitle] = useState<string>('');

  // Custom Suggestion State
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalChiefdom, setProposalChiefdom] = useState(CHIEFDOMS_DATA[0].name);
  const [proposalDetails, setProposalDetails] = useState('');
  const [userProposals, setUserProposals] = useState<{ title: string; chiefdom: string; date: string }[]>([]);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // Load voting status from localStorage on mount
  useEffect(() => {
    const savedVote = localStorage.getItem('bdc_community_poll_vote');
    if (savedVote) {
      try {
        const parsed = JSON.parse(savedVote);
        setHasVoted(true);
        setSelectedOptionId(parsed.optionId);
        setVotedOptionTitle(parsed.optionTitle);
        if (parsed.chiefdom) setSelectedChiefdom(parsed.chiefdom);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleCastVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || hasVoted) return;

    const targetOpt = options.find(o => o.id === selectedOptionId);
    if (!targetOpt) return;

    // Increment vote count in state
    setOptions(prevOptions =>
      prevOptions.map(opt =>
        opt.id === selectedOptionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );

    setHasVoted(true);
    setVotedOptionTitle(targetOpt.title);

    // Save vote to local storage
    localStorage.setItem(
      'bdc_community_poll_vote',
      JSON.stringify({
        optionId: selectedOptionId,
        optionTitle: targetOpt.title,
        chiefdom: selectedChiefdom,
        votedAt: new Date().toISOString()
      })
    );
  };

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle.trim()) return;

    const newProp = {
      title: proposalTitle,
      chiefdom: proposalChiefdom,
      date: new Date().toLocaleDateString()
    };

    setUserProposals([newProp, ...userProposals]);
    setProposalTitle('');
    setProposalDetails('');
    setProposalSuccess(true);

    setTimeout(() => {
      setProposalSuccess(false);
      setShowProposalForm(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Bo District Council • Citizen Participatory Budgeting
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
            2026/2027 Community Priority Poll
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Cast your vote to guide Council allocation of devolution grants and local revenue across Bo District chiefdoms.
          </p>
        </div>

        {/* Total Votes Badge */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 text-right">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Registered Votes</div>
          <div className="text-xl font-black text-emerald-900 font-mono flex items-center justify-end gap-1">
            <Vote className="w-5 h-5 text-amber-500" />
            {(totalVotes || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Voter Chiefdom Selection Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Your Chiefdom:</span>
          <select
            value={selectedChiefdom}
            onChange={(e) => setSelectedChiefdom(e.target.value)}
            disabled={hasVoted}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            id="poll-chiefdom-select"
          >
            {CHIEFDOMS_DATA.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {hasVoted ? (
          <div className="bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Vote Registered for {selectedChiefdom}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">
            Select your chiefdom to participate in official district priority ranking.
          </span>
        )}
      </div>

      {/* Poll Options List */}
      <form onSubmit={handleCastVote} className="space-y-4">
        <div className="space-y-3">
          {options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isSelected = selectedOptionId === option.id;

            return (
              <div
                key={option.id}
                onClick={() => {
                  if (!hasVoted) setSelectedOptionId(option.id);
                }}
                className={`p-4 rounded-xl border transition-all ${
                  hasVoted && isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                    : isSelected
                    ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                } ${!hasVoted ? 'cursor-pointer' : ''}`}
                id={`poll-option-${option.id}`}
              >
                <div className="flex items-start gap-3">
                  {/* Option Icon / Checkbox */}
                  <div className="mt-0.5 shrink-0">
                    {!hasVoted ? (
                      <input
                        type="radio"
                        name="community-poll-option"
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="w-4 h-4 text-emerald-800 focus:ring-emerald-600"
                      />
                    ) : (
                      <div className="p-1.5 rounded-lg bg-slate-100">{option.icon}</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {option.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{option.title}</span>
                      </div>

                      <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-2">
                        <span>{(option.votes || 0).toLocaleString()} votes</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[11px]">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {option.description}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      Target Chiefdoms: <strong className="text-slate-700">{option.targetChiefdoms}</strong>
                    </div>

                    {/* Progress Bar Visualization */}
                    <div className="pt-2">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isSelected ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voting Action Button */}
        {!hasVoted ? (
          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={!selectedOptionId}
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs md:text-sm rounded-xl shadow transition-all flex items-center gap-2"
              id="poll-submit-vote-btn"
            >
              <Vote className="w-4 h-4 text-amber-400" />
              Submit Official Citizen Vote
            </button>

            <button
              type="button"
              onClick={() => setShowProposalForm(!showProposalForm)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              Propose Another Community Need
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Your Citizen Vote Has Been Submitted!</span>
                <p className="text-emerald-200 text-[11px] mt-0.5">
                  Voted for: <strong>{votedOptionTitle}</strong> ({selectedChiefdom}). Votes are compiled for the upcoming Council Ordinary Session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProposalForm(!showProposalForm)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              Propose Project Idea
            </button>
          </div>
        )}
      </form>

      {/* Proposal Modal / Collapsible Form */}
      {showProposalForm && (
        <form onSubmit={handleProposalSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-300 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Propose a District Initiative for 2027 Budget
            </h3>
            <button
              type="button"
              onClick={() => setShowProposalForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initiative Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Solar Cold Storage in Koribondo Junction Market"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Chiefdom</label>
              <select
                value={proposalChiefdom}
                onChange={(e) => setProposalChiefdom(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              >
                {CHIEFDOMS_DATA.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Proposal Justification</label>
            <textarea
              rows={2}
              placeholder="Describe how this project will help farmers, traders, students, or patients in your chiefdom..."
              value={proposalDetails}
              onChange={(e) => setProposalDetails(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            ></textarea>
          </div>

          {proposalSuccess && (
            <p className="text-xs font-bold text-emerald-800 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300">
              ✓ Proposal submitted to District Budget Committee! Thank you.
            </p>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Proposal to Council
          </button>
        </form>
      )}

      {/* User Proposals Board */}
      {userProposals.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 uppercase text-[11px]">Submitted Citizen Ideas ({userProposals.length})</h4>
          <div className="space-y-1.5">
            {userProposals.map((p, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-900">{p.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{p.chiefdom} • {p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
