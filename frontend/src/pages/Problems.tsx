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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search
      fetchProblems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filter]);

  useEffect(() => {
    fetchProblems();
  }, [page]);

  const fetchProblems = () => {
    setLoading(true);
    
    // Build query params
    const params = new URLSearchParams({ page: page.toString() });
    if (filter !== "ALL") params.append("difficulty", filter.toLowerCase());
    if (search) params.append("search", search);

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/problems?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const mappedProblems = data.data.map((p: any) => ({
            id: p.id,
            slug: p.id, // Using id as slug for routing
            title: p.title,
            difficulty: p.difficulty?.toUpperCase() || "EASY",
            description: p.statement || "",
            _count: { testCases: 0 } // Backend doesn't return test cases count yet
          }));
          setProblems(mappedProblems);
          setTotalPages(Math.ceil(data.count / 10) || 1);
          setStats({
            easy: data.easyCount || 0,
            medium: data.mediumCount || 0,
            hard: data.hardCount || 0
          });
        } else {
          setProblems([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProblems([]);
        setLoading(false);
      });
  };

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
              {`[CLASSIFIED] Master these algorithms to dominate in ranked battles. Solutions are judged against ${totalTestCases} total test cases.`}
            </p>
          </div>
        </div>

        <ProblemsList 
          problems={problems} 
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          stats={stats}
        />

        {/* Pagination Controls */}
        {!loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded border border-[#00e5ff]/30 text-[#00e5ff] disabled:opacity-50 hover:bg-[#00e5ff]/10 transition-colors"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                  page === pageNum 
                    ? "bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]" 
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}
              >
                {pageNum}
              </button>
            ))}

            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded border border-[#00e5ff]/30 text-[#00e5ff] disabled:opacity-50 hover:bg-[#00e5ff]/10 transition-colors"
              style={{ fontFamily: "'Chakra Petch', sans-serif" }}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
