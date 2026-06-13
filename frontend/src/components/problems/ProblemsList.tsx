
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Play, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  _count: { testCases: number };
};

export function ProblemsList({ 
  problems,
  loading,
  filter,
  setFilter,
  search,
  setSearch
}: { 
  problems: Problem[];
  loading: boolean;
  filter: "ALL" | "EASY" | "MEDIUM" | "HARD";
  setFilter: (f: "ALL" | "EASY" | "MEDIUM" | "HARD") => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Since filtering is now server-side, we just map the raw props
  const filteredProblems = problems;

  const stats = useMemo(() => {
    return {
      easy: problems.filter((p) => p.difficulty === "EASY").length,
      medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
      hard: problems.filter((p) => p.difficulty === "HARD").length,
    };
  }, [problems]);

  return (
    <div className="w-full">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        {/* Search */}
        <div className="relative w-full md:w-64 group/search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00e5ff]/50" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#00e5ff]/[0.03] border border-[#00e5ff]/20 rounded pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#00e5ff] focus:shadow-[0_0_0_2px_rgba(0,229,255,0.15)] transition-all"
            style={{ borderRadius: '4px' }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold transition-all border ${
                  isActive ? "bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]" : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
                }`}
                style={{ borderRadius: '4px' }}
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm font-medium mb-4 px-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <span className="flex items-center gap-1.5" style={{ color: '#4ade80' }}>{stats.easy} Easy</span>
        <span>•</span>
        <span className="flex items-center gap-1.5" style={{ color: '#f97316' }}>{stats.medium} Medium</span>
        <span>•</span>
        <span className="flex items-center gap-1.5" style={{ color: '#f43f5e' }}>{stats.hard} Hard</span>
      </div>

      {/* List */}
      <div className="rounded-xl overflow-hidden bg-transparent">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b" style={{ background: 'rgba(0,229,255,0.04)', borderColor: 'rgba(0,229,255,0.15)', letterSpacing: '0.12em', fontSize: '11px', color: 'rgba(0,229,255,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="w-8 flex justify-center">STATUS</div>
          <div>TITLE</div>
          <div className="w-24">DIFFICULTY</div>
          <div className="w-24 text-right">TEST CASES</div>
          <div className="w-28 text-right pr-2">ACTION</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {filteredProblems.map((problem) => {
            const isExpanded = expandedId === problem.id;
            const isFeatured = problem.title === "Valid Parentheses";
            
            // Mock solved status (random for demo as requested if we don't have it in DB yet, but we'll leave it empty unless featured)
            const isSolved = isFeatured; // Just for demo

            return (
              <div key={problem.id} className="flex flex-col relative group">
                
                {/* Row */}
                <div 
                  className="grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-4 items-center cursor-pointer group/row transition-all duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderLeft: '2px solid transparent' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.03)';
                    e.currentTarget.style.borderLeftColor = 'rgba(0,229,255,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : problem.id)}
                >
                  <div className="w-8 flex justify-center">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#4ade80', filter: 'drop-shadow(0 0 4px #4ade80)' }} />
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white group-hover/row:text-[#00e5ff] transition-colors" style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 600 }}>{problem.title}</span>
                    {isFeatured && (
                      <span className="px-2 py-0.5 rounded uppercase" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.4)', color: '#00e5ff', fontSize: '10px', letterSpacing: '0.1em' }}>Today's Featured</span>
                    )}
                  </div>

                  <div className="w-24">
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      borderRadius: '3px',
                      padding: '2px 8px',
                      ...(problem.difficulty === "EASY" ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' } :
                         problem.difficulty === "MEDIUM" ? { background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316' } :
                         { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.4)', color: '#f43f5e' })
                    }}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="w-24 text-right text-sm text-gray-500 font-mono">
                    {problem._count.testCases}
                  </div>

                  <div className="w-28 flex items-center justify-end">
                    <Link 
                      to={`/problems/${problem.slug}`}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-cyan/10 text-accent-cyan font-semibold text-xs border border-accent-cyan/20 hover:bg-accent-cyan hover:text-bg-primary transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Solve
                    </Link>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform sm:hidden ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Accordion Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-bg-secondary/50 border-t border-border text-sm text-gray-400">
                        <p className="line-clamp-2">{problem.description}</p>
                        <Link 
                          to={`/problems/${problem.slug}`}
                          className="sm:hidden mt-4 flex items-center justify-center gap-2 w-full py-2 bg-accent-cyan text-bg-primary rounded-lg font-bold"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Solve Now
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
          
          {filteredProblems.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No problems found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
