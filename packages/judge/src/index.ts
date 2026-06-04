export { judgeQueue, addJudgeJob } from "./queue";
// We don't export worker.ts here as it's meant to be run as a standalone process
// and we don't want the web/socket server importing vm2 or BullMQ Worker classes accidentally.
