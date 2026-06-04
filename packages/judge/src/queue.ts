import { Queue } from "bullmq";
import Redis from "ioredis";
import type { JudgeJobPayload } from "@algobattle/types";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

export const judgeQueue = new Queue<JudgeJobPayload, any, string>("judge", {
  connection,
});

/**
 * Enqueue a submission to be judged
 */
export async function addJudgeJob(payload: JudgeJobPayload) {
  await judgeQueue.add("judge-submission", payload, {
    removeOnComplete: true,
    removeOnFail: true,
    jobId: payload.submissionId, // Prevent duplicate judging
  });
}
