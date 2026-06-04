import { Worker } from "bullmq";
import Redis from "ioredis";
import { prisma } from "@algobattle/db";
import { executeSandbox, executePiston, normalizeOutput } from "./sandbox";
import { scoreSubmission } from "./scorer";
import type { JudgeJobPayload, TestCaseResult, JudgeResult } from "@algobattle/types";

const USE_PISTON_FOR_JS = process.env.USE_PISTON_FOR_JS === "true";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

console.log("🚀 Starting Judge Worker...");

const worker = new Worker<JudgeJobPayload>(
  "judge",
  async (job) => {
    const payload = job.data;
    console.log(`[Judge] Processing submission: ${payload.submissionId} for battle: ${payload.battleId} Language: ${payload.language}`);

    try {
      // 1. Fetch test cases for the problem
      const problem = await prisma.problem.findUnique({
        where: { id: payload.problemId },
        include: { testCases: { orderBy: { order: "asc" } } },
      });

      if (!problem || problem.testCases.length === 0) {
        throw new Error("Problem or test cases not found");
      }

      const testCaseResults: TestCaseResult[] = [];

      // 2. Run code against each test case sequentially
      for (const tc of problem.testCases) {
        let result;
        if ((!payload.language || payload.language.toLowerCase() === "javascript") && !USE_PISTON_FOR_JS) {
          result = await executeSandbox(payload.code, tc.input, payload.timeLimitMs);
        } else {
          result = await executePiston(payload.code, tc.input, payload.language || "javascript", payload.timeLimitMs);
        }

        // Output was already normalized by sandbox/piston, but let's be safe
        const actualTrimmed = normalizeOutput(result.output);
        const expectedTrimmed = normalizeOutput(tc.expected);

        const passed = !result.error && !result.timedOut && actualTrimmed === expectedTrimmed;

        testCaseResults.push({
          testCaseId: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: result.output,
          passed,
          executionTimeMs: result.executionTimeMs,
          error: result.error,
          isHidden: tc.isHidden,
          order: tc.order,
        });

        // Fail fast optimization: If a test fails, we can optionally stop judging.
        // For AlgoBattle, we continue so we can report exactly how many passed.
      }

      // 3. Score the full submission
      const scored = scoreSubmission(testCaseResults);
      const { verdict, passedCases, totalCases, executionTimeMs } = scored;

      // 4. Update the submission record in the database
      await prisma.submission.update({
        where: { id: payload.submissionId },
        data: {
          verdict,
          passedCases,
          totalCases,
          executionTimeMs,
        },
      });

      // 5. Construct the final result
      const judgeResult: JudgeResult = {
        submissionId: payload.submissionId,
        battleId: payload.battleId,
        userId: payload.userId,
        verdict: scored.verdict,
        passedCases: scored.passedCases,
        totalCases: scored.totalCases,
        executionTimeMs: scored.executionTimeMs,
        testCaseResults,
        error: scored.error
      };

      // 6. Publish the result to Redis pub/sub for the socket server to broadcast
      const channel = `judge:result:${payload.battleId}`;
      await publisher.publish(channel, JSON.stringify(judgeResult));

      console.log(`[Judge] Finished ${payload.submissionId} -> ${verdict} (${passedCases}/${totalCases})`);

      return judgeResult;

    } catch (error) {
      console.error(`[Judge] FATAL Error processing submission ${payload.submissionId}:`, error);

      // Fallback update
      await prisma.submission.update({
        where: { id: payload.submissionId },
        data: { verdict: "RUNTIME_ERROR" },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 4, // Process up to 4 submissions in parallel
  }
);

worker.on("failed", (job, err) => {
  console.error(`[Judge] Job ${job?.id} failed:`, err.message);
});

worker.on("ready", () => {
  console.log("✅ Judge Worker is ready and waiting for jobs");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await worker.close();
  publisher.quit();
  process.exit(0);
});
