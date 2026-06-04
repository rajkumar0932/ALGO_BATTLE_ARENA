import { prisma } from "@algobattle/db";
import { notFound } from "next/navigation";
import { ArrowLeft, Swords } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

export default async function ProblemDetailPage({ params }: Props) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    include: {
      testCases: {
        where: { isHidden: false },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!problem) notFound();

  const difficultyClass =
    problem.difficulty === "EASY"
      ? "badge-easy"
      : problem.difficulty === "MEDIUM"
      ? "badge-medium"
      : "badge-hard";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/problems"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Problems
      </Link>

      {/* Problem Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{problem.title}</h1>
            <span className={difficultyClass}>{problem.difficulty}</span>
          </div>
        </div>
        <Link
          href="/battle"
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Swords className="w-4 h-4" />
          Battle with This
        </Link>
      </div>

      {/* Problem Description */}
      <div className="glass-card neon-border p-8 mb-8">
        <div className="prose prose-invert max-w-none prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border prose-code:text-accent-cyan prose-headings:text-gray-100 prose-p:text-gray-300 prose-strong:text-gray-200 prose-li:text-gray-300">
          <div
            dangerouslySetInnerHTML={{
              __html: problem.description
                .replace(/^# .+\n/, "")
                .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
                .replace(/`([^`]+)`/g, "<code>$1</code>")
                .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-100 mt-8 mb-4">$1</h2>')
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br />"),
            }}
          />
        </div>
      </div>

      {/* Visible Test Cases */}
      <div className="glass-card neon-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">
            Sample Test Cases ({problem.testCases.length})
          </h2>
        </div>
        <div className="divide-y divide-border">
          {problem.testCases.map((tc, i) => (
            <div key={tc.id} className="p-6">
              <p className="text-sm font-semibold text-gray-400 mb-3">
                Example {i + 1}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Input
                  </p>
                  <pre className="bg-bg-secondary border border-border rounded-lg p-3 text-sm font-mono text-accent-cyan overflow-x-auto">
                    {tc.input}
                  </pre>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Expected Output
                  </p>
                  <pre className="bg-bg-secondary border border-border rounded-lg p-3 text-sm font-mono text-accent-emerald overflow-x-auto">
                    {tc.expected}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter Code */}
      <div className="glass-card neon-border overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">Starter Code</h2>
        </div>
        <pre className="p-6 text-sm font-mono text-gray-300 overflow-x-auto bg-bg-secondary/50">
          {problem.starterCode}
        </pre>
      </div>
    </div>
  );
}
