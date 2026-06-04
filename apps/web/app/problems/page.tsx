import { prisma } from "@algobattle/db";
import { Code } from "lucide-react";
import { ProblemsList } from "@/components/problems/ProblemsList";

export default async function ProblemsPage() {
  const problems = await prisma.problem.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      description: true,
      _count: { select: { testCases: true } }
    },
    orderBy: [
      { difficulty: "asc" },
      { title: "asc" },
    ],
  });

  const difficultyOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };
  const sorted = [...problems].sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl md:text-5xl mb-4 flex items-center justify-start gap-4">
            <Code className="w-10 h-10" style={{ color: '#00e5ff', filter: 'drop-shadow(0 0 15px rgba(0,229,255,0.6))' }} />
            <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: 'white' }}>
              Problem <span style={{ background: 'linear-gradient(to right, #00e5ff, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Library</span>
            </span>
          </h1>
          <div style={{ borderLeft: '2px solid rgba(0,229,255,0.3)', paddingLeft: '12px' }}>
            <p className="text-gray-400 text-lg max-w-2xl font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              [CLASSIFIED] Master these algorithms to dominate in ranked battles. Solutions are judged against {problems.reduce((a, p) => a + p._count.testCases, 0)} total test cases.
            </p>
          </div>
        </div>

        <ProblemsList problems={sorted} />
      </div>
    </div>
  );
}
