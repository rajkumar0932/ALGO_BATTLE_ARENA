import type { TestCaseResult, BattleVerdict } from "@algobattle/types";

export function scoreSubmission(results: TestCaseResult[]): {
  verdict: BattleVerdict;
  passedCases: number;
  totalCases: number;
  executionTimeMs: number;
  error?: string;
} {
  const totalCases = results.length;
  let passedCases = 0;
  let totalExecutionTime = 0;
  let firstFailedVerdict: BattleVerdict | null = null;
  let firstFailedError: string | undefined = undefined;

  for (const result of results) {
    totalExecutionTime += result.executionTimeMs;

    if (result.passed) {
      passedCases++;
    } else if (!firstFailedVerdict) {
      // Determine the specific reason for the first failure
      if (result.error) {
        firstFailedError = result.error;
        if (result.error.startsWith("COMPILE_ERROR:")) {
          firstFailedVerdict = "COMPILE_ERROR";
        } else if (result.error.includes("timed out") || result.error === "Time Limit Exceeded") {
          firstFailedVerdict = "TIME_LIMIT_EXCEEDED";
        } else {
          firstFailedVerdict = "RUNTIME_ERROR";
        }
      } else {
        firstFailedVerdict = "WRONG_ANSWER";
      }
    }
  }

  const verdict = firstFailedVerdict || "ACCEPTED";

  return {
    verdict,
    passedCases,
    totalCases,
    executionTimeMs: totalExecutionTime,
    error: firstFailedError
  };
}
