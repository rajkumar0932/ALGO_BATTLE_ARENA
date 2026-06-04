"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy, Swords, TrendingUp, TrendingDown, Clock, Zap,
  CheckCircle2, XCircle, Brain, Building2, Users, BarChart3,
  ArrowRight, ChevronDown, ChevronUp, Sparkles, Target,
  BookOpen, Award, AlertTriangle
} from "lucide-react";

interface ReviewData {
  battle: any;
  problem: any;
  players: any;
  mySubmission: any;
  opponentSubmission: any;
  stats: any;
  interviewIntelligence: any;
  similarProblems: any[];
}

interface AIAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  optimalTimeComplexity: string;
  isOptimal: boolean;
  strengths: string[];
  improvements: string[];
  interviewTip: string;
  alternativeApproach: string;
  interviewScore: number;
}

export function BattleReview({ battleId, currentUserId }: { battleId: string; currentUserId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [showOptimal, setShowOptimal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/battles/${battleId}/review`);
        if (!res.ok) throw new Error("Failed to load");
        const d = await res.json();
        setData(d);

        // Trigger AI analysis if user has a submission
        if (d.mySubmission?.code) {
          const aiRes = await fetch("/api/review/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: d.mySubmission.code,
              problemDescription: d.problem.description,
              problemTitle: d.problem.title,
              starterCode: d.problem.starterCode,
              verdict: d.mySubmission.verdict,
              passedCases: d.mySubmission.passedCases,
              totalCases: d.mySubmission.totalCases,
            }),
          });
          if (aiRes.ok) {
            setAnalysis(await aiRes.json());
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setAnalysisLoading(false);
      }
    }
    load();
  }, [battleId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse">Analyzing your battle performance...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <XCircle className="w-12 h-12 text-accent-rose mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Could not load review data</p>
          <Link href="/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isWinner = data.battle.winnerId === currentUserId;
  const isDraw = !data.battle.winnerId && data.battle.status === "COMPLETED";
  const myVerdict = data.mySubmission?.verdict || "N/A";
  const opVerdict = data.opponentSubmission?.verdict || "N/A";

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  };

  // Company logo colors (consistent hashing)
  const companyColors: Record<string, string> = {
    Google: "#4285F4", Amazon: "#FF9900", Meta: "#0668E1", Microsoft: "#00A4EF",
    Apple: "#A2AAAD", Bloomberg: "#2800D7", Netflix: "#E50914", Uber: "#000000",
    Stripe: "#635BFF", Spotify: "#1DB954", LinkedIn: "#0077B5", Adobe: "#FF0000",
    Goldman_Sachs: "#6F9FD8", Oracle: "#F80000", Coinbase: "#0052FF",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ═══ Section 1: Battle Summary ═══ */}
      <div className={`glass-card neon-border p-8 relative overflow-hidden ${
        isWinner ? "border-accent-emerald/30" : isDraw ? "border-gray-500/30" : "border-accent-rose/30"
      }`}>
        <div className={`absolute inset-0 opacity-5 ${
          isWinner ? "bg-accent-emerald" : isDraw ? "bg-gray-500" : "bg-accent-rose"
        }`} />
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-6">
            <Trophy className={`w-16 h-16 mb-3 ${
              isWinner ? "text-accent-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
              isDraw ? "text-gray-400" : "text-gray-600"
            }`} />
            <h1 className="text-4xl font-black">
              {isWinner ? "Victory!" : isDraw ? "Draw" : "Defeat"}
            </h1>
            <p className="text-gray-400 mt-1">{data.problem.title}</p>
          </div>

          {/* VS Layout */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* You */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">You</p>
              <p className="font-bold text-gray-200 mb-2">
                {data.players.player1?.id === currentUserId ? data.players.player1?.username : data.players.player2?.username}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                myVerdict === "ACCEPTED" ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/25" :
                "bg-accent-rose/15 text-accent-rose border border-accent-rose/25"
              }`}>
                {myVerdict === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {myVerdict.replace(/_/g, " ")}
              </div>
              {data.mySubmission?.executionTimeMs && (
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />{data.mySubmission.executionTimeMs}ms
                </p>
              )}
            </div>

            {/* VS badge */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-bg-secondary border-2 border-border flex items-center justify-center">
                <Swords className="w-6 h-6 text-accent-cyan" />
              </div>
              <p className="text-xs text-gray-600 mt-2">VS</p>
            </div>

            {/* Opponent */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Opponent</p>
              <p className="font-bold text-gray-200 mb-2">
                {data.opponentSubmission?.username || "Unknown"}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                opVerdict === "ACCEPTED" ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/25" :
                opVerdict === "N/A" ? "bg-bg-hover text-gray-500 border border-border" :
                "bg-accent-rose/15 text-accent-rose border border-accent-rose/25"
              }`}>
                {opVerdict === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : opVerdict === "N/A" ? null : <XCircle className="w-3.5 h-3.5" />}
                {opVerdict === "N/A" ? "No submission" : opVerdict.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Section 2: Interview Intelligence ═══ */}
      <div className="glass-card neon-border p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-accent-purple" />
          Where This Problem Appears
        </h2>

        {data.interviewIntelligence.sightings.length === 0 ? (
          <p className="text-gray-500">No interview sighting data available.</p>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Asked in <span className="text-gray-200 font-semibold">{data.interviewIntelligence.totalInterviews}+</span> reported interviews across{" "}
              <span className="text-gray-200 font-semibold">{data.interviewIntelligence.companies.length}</span> companies.
            </p>

            {/* Company grid */}
            <div className="flex flex-wrap gap-3 mb-6">
              {data.interviewIntelligence.companies.map((company: string) => {
                const sightings = data.interviewIntelligence.sightings.filter(
                  (s: any) => s.company === company
                );
                const totalFreq = sightings.reduce((a: number, s: any) => a + s.frequency, 0);
                const color = companyColors[company.replace(/\s/g, "_")] || "#6B7280";
                return (
                  <div
                    key={company}
                    className="px-4 py-2.5 rounded-xl bg-bg-secondary border border-border hover:border-border-hover transition-colors"
                    style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                  >
                    <p className="font-semibold text-gray-200 text-sm">{company}</p>
                    <p className="text-xs text-gray-500">{totalFreq}x reported</p>
                  </div>
                );
              })}
            </div>

            {/* Role tags */}
            <div className="flex flex-wrap gap-2">
              {[...new Set(data.interviewIntelligence.sightings.map((s: any) => s.role))].map(
                (role: any) => (
                  <span key={role} className="px-2.5 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium border border-accent-purple/20">
                    {role}
                  </span>
                )
              )}
              {[...new Set(data.interviewIntelligence.sightings.map((s: any) => s.round))].map(
                (round: any) => (
                  <span key={round} className="px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-medium border border-accent-cyan/20">
                    {round}
                  </span>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* ═══ Section 3: Your Performance Percentile ═══ */}
      <div className="glass-card neon-border p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-accent-amber" />
          Your Performance
        </h2>

        <div className="space-y-4">
          {/* Stat rows */}
          {[
            {
              label: "Solved it",
              value: `${data.stats.solveRate}% of users`,
              icon: Users,
              color: "text-accent-cyan",
            },
            {
              label: "Your time",
              value: data.mySubmission?.executionTimeMs ? formatTime(data.mySubmission.executionTimeMs) : "N/A",
              icon: Clock,
              color: "text-accent-amber",
            },
            {
              label: "Faster than",
              value: `${data.stats.fasterThanPercent}% of users who solved it`,
              icon: Zap,
              color: "text-accent-emerald",
            },
            {
              label: "Avg solve time",
              value: data.stats.avgSolveTimeMs ? formatTime(data.stats.avgSolveTimeMs) : "N/A",
              icon: BarChart3,
              color: "text-gray-400",
            },
            {
              label: "First attempt",
              value: myVerdict === "ACCEPTED"
                ? `You got it ✓ (${data.stats.firstAttemptRate}% of users needed only 1 attempt)`
                : `Not solved (${data.stats.firstAttemptRate}% solved first try)`,
              icon: Target,
              color: myVerdict === "ACCEPTED" ? "text-accent-emerald" : "text-accent-rose",
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <row.icon className={`w-4 h-4 ${row.color}`} />
                <span className="text-gray-400 text-sm">{row.label}</span>
              </div>
              <span className="text-gray-200 font-medium text-sm text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Bell Curve Visualization */}
        <div className="mt-8 p-4 bg-bg-secondary rounded-xl border border-border">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
            Performance Distribution
          </p>
          <div className="relative h-16">
            {/* Bell curve SVG */}
            <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
              {/* Bell curve */}
              <path
                d="M0,55 C20,55 60,52 100,40 C140,28 160,10 200,5 C240,10 260,28 300,40 C340,52 380,55 400,55"
                fill="none"
                stroke="rgba(107,114,128,0.3)"
                strokeWidth="2"
              />
              <path
                d="M0,55 C20,55 60,52 100,40 C140,28 160,10 200,5 C240,10 260,28 300,40 C340,52 380,55 400,55 L400,60 L0,60 Z"
                fill="url(#bellGradient)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              {/* User position marker */}
              <line
                x1={Math.max(10, Math.min(390, data.stats.fasterThanPercent * 4))}
                y1="0"
                x2={Math.max(10, Math.min(390, data.stats.fasterThanPercent * 4))}
                y2="60"
                stroke="#00E5FF"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              <circle
                cx={Math.max(10, Math.min(390, data.stats.fasterThanPercent * 4))}
                cy="5"
                r="4"
                fill="#00E5FF"
              />
            </svg>
            <div
              className="absolute top-0 text-[10px] font-bold text-accent-cyan -translate-x-1/2"
              style={{ left: `${Math.max(5, Math.min(95, data.stats.fasterThanPercent))}%` }}
            >
              You
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Slowest</span>
            <span>Fastest</span>
          </div>
        </div>
      </div>

      {/* ═══ Section 4: AI Solution Review ═══ */}
      <div className="glass-card neon-border p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-accent-cyan" />
          AI Solution Review
        </h2>

        {analysisLoading ? (
          <div className="flex items-center gap-3 text-gray-400 animate-pulse">
            <Brain className="w-5 h-5 animate-pulse" />
            Analyzing your solution with AI...
          </div>
        ) : !analysis ? (
          <p className="text-gray-500">AI analysis unavailable.</p>
        ) : (
          <div className="space-y-6">
            {/* Complexity badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-xl border border-border min-w-[140px]">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Your Time</p>
                <p className={`text-2xl font-bold ${analysis.isOptimal ? "text-accent-emerald" : "text-accent-amber"}`}>
                  {analysis.timeComplexity}
                </p>
              </div>
              {!analysis.isOptimal && (
                <>
                  <div className="flex items-center text-gray-600">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-center p-4 bg-accent-emerald/5 rounded-xl border border-accent-emerald/20 min-w-[140px]">
                    <p className="text-xs text-accent-emerald uppercase tracking-wider font-semibold mb-2">Optimal</p>
                    <p className="text-2xl font-bold text-accent-emerald">{analysis.optimalTimeComplexity}</p>
                  </div>
                </>
              )}
              <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-xl border border-border min-w-[140px]">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Space</p>
                <p className="text-2xl font-bold text-gray-300">{analysis.spaceComplexity}</p>
              </div>
            </div>

            {/* Interview Score */}
            <div className="flex items-center gap-6 p-4 bg-bg-secondary rounded-xl border border-border">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(107,114,128,0.2)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="35" fill="none"
                    stroke={analysis.interviewScore >= 7 ? "#10B981" : analysis.interviewScore >= 4 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="6"
                    strokeDasharray={`${(analysis.interviewScore / 10) * 220} 220`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-gray-100">{analysis.interviewScore}</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-200">Interview Score</p>
                <p className="text-sm text-gray-400">
                  {analysis.interviewScore >= 7
                    ? "Strong interview performance"
                    : analysis.interviewScore >= 4
                    ? "May pass with follow-up discussion"
                    : "Needs significant improvement"}
                </p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-accent-emerald/5 rounded-xl border border-accent-emerald/15">
                <h3 className="font-semibold text-accent-emerald text-sm flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-accent-amber/5 rounded-xl border border-accent-amber/15">
                <h3 className="font-semibold text-accent-amber text-sm flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" /> Improvements
                </h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-accent-amber mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Tip */}
            <div className="p-4 bg-accent-purple/5 rounded-xl border border-accent-purple/15">
              <h3 className="font-semibold text-accent-purple text-sm flex items-center gap-2 mb-2">
                <Award className="w-4 h-4" /> Interviewer&apos;s Perspective
              </h3>
              <p className="text-sm text-gray-300">{analysis.interviewTip}</p>
            </div>

            {/* Alternative Approach — Collapsible */}
            <button
              onClick={() => setShowOptimal(!showOptimal)}
              className="flex items-center gap-2 text-sm font-medium text-accent-cyan hover:underline"
            >
              {showOptimal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showOptimal ? "Hide" : "Show"} Alternative Approach
            </button>
            {showOptimal && (
              <div className="p-4 bg-bg-secondary rounded-xl border border-border animate-slide-up">
                <p className="text-sm text-gray-300">{analysis.alternativeApproach}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Section 5: Similar Problems ═══ */}
      {data.similarProblems.length > 0 && (
        <div className="glass-card neon-border p-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-accent-emerald" />
            Practice Similar Problems
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.similarProblems.map((p: any) => {
              const dc = p.difficulty === "EASY" ? "badge-easy" : p.difficulty === "MEDIUM" ? "badge-medium" : "badge-hard";
              return (
                <Link
                  key={p.slug}
                  href={`/problems/${p.slug}`}
                  className="p-4 bg-bg-secondary rounded-xl border border-border hover:border-accent-cyan/30 transition-all group"
                >
                  <p className="font-medium text-gray-200 group-hover:text-accent-cyan transition-colors mb-2">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={dc}>{p.difficulty}</span>
                    {p.tags?.slice(0, 2).map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-hover text-gray-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pb-10">
        <Link href="/dashboard" className="btn-secondary px-8">Dashboard</Link>
        <Link href="/battle" className="btn-primary px-8 flex items-center gap-2">
          <Swords className="w-4 h-4" /> Battle Again
        </Link>
      </div>
    </div>
  );
}
