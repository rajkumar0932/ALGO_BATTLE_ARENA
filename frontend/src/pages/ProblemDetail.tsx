import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Code } from "lucide-react";

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  examples?: string;
  constraints?: string;
}

export default function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/problems/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch(() => {
        setProblem({
          id: "mock",
          slug: slug,
          title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          difficulty: "EASY",
          description: "Problem details will be available once the backend is connected.",
        });
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) return null;

  const difficultyClass =
    problem.difficulty === "EASY" ? "badge-easy" :
    problem.difficulty === "MEDIUM" ? "badge-medium" : "badge-hard";

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Code className="w-8 h-8" style={{ color: "#00e5ff" }} />
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              {problem.title}
            </h1>
            <span className={difficultyClass}>{problem.difficulty}</span>
          </div>
        </div>

        <div
          className="rounded-xl p-8"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>
            Problem Description
          </h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>

          {problem.examples && (
            <>
              <h3 className="text-lg font-bold text-white mt-8 mb-4">Examples</h3>
              <pre
                className="text-gray-300 text-sm p-4 rounded-lg overflow-x-auto"
                style={{ background: "rgba(0,0,0,0.3)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                {problem.examples}
              </pre>
            </>
          )}

          {problem.constraints && (
            <>
              <h3 className="text-lg font-bold text-white mt-8 mb-4">Constraints</h3>
              <p className="text-gray-300 text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {problem.constraints}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
