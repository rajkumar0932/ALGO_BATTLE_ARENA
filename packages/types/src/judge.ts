// ─── Judge Types ─────────────────────────────────────────
// Types for the code execution and judging system

import type { BattleVerdict } from "./battle";

/** Payload enqueued to the BullMQ judge queue */
export interface JudgeJobPayload {
  submissionId: string;
  battleId: string;
  userId: string;
  code: string;
  language: string;
  problemId: string;
  timeLimitMs: number;  // per test case, default 2000ms
}

/** Result of executing a single test case in the sandbox */
export interface TestCaseResult {
  testCaseId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTimeMs: number;
  error?: string;
  isHidden: boolean;
  order: number;
}

/** Final scored result for a full submission */
export interface JudgeResult {
  submissionId: string;
  battleId: string;
  userId: string;
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  executionTimeMs: number;         // total across all test cases
  testCaseResults: TestCaseResult[];
  error?: string;
}

/** Result from the sandbox execution of a single piece of code */
export interface SandboxResult {
  output: string;
  executionTimeMs: number;
  error?: string;
  timedOut: boolean;
}
