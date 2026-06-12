
import React from "react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PROBLEMS = [
  { num: 1, title: "Two Sum", diff: "EASY", diffColor: "badge-easy", code: "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):..." },
  { num: 2, title: "Valid Parentheses", diff: "EASY", diffColor: "badge-easy", code: "def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}..." },
  { num: 3, title: "Merge Intervals", diff: "MEDIUM", diffColor: "badge-medium", code: "def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []..." },
  { num: 4, title: "LRU Cache", diff: "MEDIUM", diffColor: "badge-medium", code: "class LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity..." },
  { num: 5, title: "Trapping Rain Water", diff: "HARD", diffColor: "badge-hard", code: "def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1..." },
];

export function FeaturedProblems() {
  return (
    <section className="py-24 relative bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Today's Battle Problems</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The same 5 problems power all ranked matches. Master them to guarantee victory.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {PROBLEMS.map((prob, i) => (
            <ScrollReveal key={prob.num} delay={i * 0.1} yOffset={20}>
              <Link to={`/problems`} className="glass-card p-6 flex flex-col h-full group hover:-translate-y-1 transition-transform border border-border hover:border-gray-500 bg-bg-card relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-mono">#{prob.num}</span>
                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-accent-cyan transition-colors">{prob.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">5 test cases</span>
                    <span className={prob.diffColor}>{prob.diff}</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-gray-400 overflow-hidden relative border border-border">
                  <pre>{prob.code}</pre>
                  {/* Blur overlay that lifts on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117] backdrop-blur-[2px] group-hover:backdrop-blur-0 group-hover:to-transparent/50 transition-all duration-300"></div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
          
          <ScrollReveal delay={0.5} yOffset={20}>
             <div className="glass-card p-6 flex flex-col items-center justify-center h-full border border-dashed border-gray-600 hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all group cursor-pointer bg-bg-card">
               <h3 className="text-xl font-bold text-gray-300 group-hover:text-accent-cyan transition-colors mb-2">View All Problems →</h3>
               <p className="text-sm text-gray-500">Practice offline before you battle.</p>
             </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
