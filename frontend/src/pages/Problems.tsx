import { useEffect, useState } from "react";
import { Code } from "lucide-react";
import { ProblemsList } from "@/components/problems/ProblemsList";

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  _count: { testCases: number };
}

const MOCK_PROBLEMS: Problem[] = [
  { id: "1", slug: "two-sum", title: "Two Sum", difficulty: "EASY", description: "Given an array of integers, return indices of the two numbers that add up to a specific target.", _count: { testCases: 5 } },
  { id: "2", slug: "longest-substring", title: "Longest Substring Without Repeating Characters", difficulty: "MEDIUM", description: "Find the length of the longest substring without repeating characters.", _count: { testCases: 8 } },
  { id: "3", slug: "median-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "HARD", description: "Find the median of two sorted arrays.", _count: { testCases: 10 } },
  { id: "4", slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "EASY", description: "Determine if the input string is valid based on bracket rules.", _count: { testCases: 6 } },
  { id: "5", slug: "binary-search", title: "Binary Search", difficulty: "EASY", description: "Search for a target value in a sorted array.", _count: { testCases: 7 } },
];

export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/problems`)
      .then((r) => r.json())
      .then((data) => {
        setProblems(data);
        setLoading(false);
      })
      .catch(() => {
        setProblems(MOCK_PROBLEMS);
        setLoading(false);
      });
  }, []);

  const difficultyOrder = { EASY: 0, MEDIUM: 1, HARD: 2 };
  const sorted = [...problems].sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );

  const totalTestCases = problems.reduce((a, p) => a + p._count.testCases, 0);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#0a0f1e]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="mb-10 text-left">
          <h1 className="text-4xl md:text-5xl mb-4 flex items-center justify-start gap-4">
            <Code className="w-10 h-10" style={{ color: "#00e5ff", filter: "drop-shadow(0 0 15px rgba(0,229,255,0.6))" }} />
            <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: "white" }}>
              Problem{" "}
              <span style={{ background: "linear-gradient(to right, #00e5ff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Library
              </span>
            </span>
          </h1>
          <div style={{ borderLeft: "2px solid rgba(0,229,255,0.3)", paddingLeft: "12px" }}>
            <p className="text-gray-400 text-lg max-w-2xl font-mono text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {loading
                ? "[LOADING PROBLEMS...]"
                : `[CLASSIFIED] Master these algorithms to dominate in ranked battles. Solutions are judged against ${totalTestCases} total test cases.`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <ProblemsList problems={sorted} />
        )}
      </div>
    </div>
  );
}
