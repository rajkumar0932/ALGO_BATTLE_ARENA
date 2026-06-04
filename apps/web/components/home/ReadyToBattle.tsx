"use client";

import React from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

export function ReadyToBattle() {
  return (
    <section className="relative py-32 overflow-hidden bg-bg-primary">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/10 blur-[100px] rounded-full mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-purple/10 blur-[120px] rounded-full mix-blend-screen"
        />
      </div>

      {/* Floating code snippets */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none font-mono text-xs text-accent-cyan flex items-center justify-between px-10">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block whitespace-pre"
        >
{`def merge_sort(arr):
  if len(arr) <= 1:
      return arr
  mid = len(arr) // 2
  L = merge_sort(arr[:mid])
  R = merge_sort(arr[mid:])
  return merge(L, R)`}
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden md:block whitespace-pre text-accent-purple"
        >
{`const binarySearch = (arr, val) => {
  let start = 0;
  let end = arr.length - 1;
  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (arr[mid] === val) return mid;
    if (val < arr[mid]) end = mid - 1;
    else start = mid + 1;
  }
  return -1;
};`}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-5xl md:text-7xl font-black mb-6">Ready to Battle?</h2>
          <p className="text-gray-300 text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
            The arena is waiting. Match up against an opponent of your skill level in seconds.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col items-center justify-center">
            <Link 
              href="/battle" 
              className="inline-block px-12 py-5 bg-accent-cyan text-bg-primary font-black text-xl md:text-2xl rounded-xl transition-all duration-300 hover:bg-accent-cyan/90 shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:shadow-[0_0_60px_rgba(0,212,255,0.6)] hover:-translate-y-1"
            >
              Enter Matchmaking
            </Link>
            <p className="mt-6 text-sm text-gray-500 font-medium tracking-wide">
              JOIN <span className="text-gray-300">2,400+</span> COMPETITIVE CODERS ONLINE
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
