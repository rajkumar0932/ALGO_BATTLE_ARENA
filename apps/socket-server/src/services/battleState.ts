import Redis from "ioredis";
import type { BattleState } from "@algobattle/types";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const BATTLE_PREFIX = "battle:";
const TTL_SECONDS = 7200; // 2 hours

export async function createBattleState(state: BattleState): Promise<void> {
  const key = `${BATTLE_PREFIX}${state.battleId}`;
  await redis.set(key, JSON.stringify(state), "EX", TTL_SECONDS);
}

export async function getBattleState(battleId: string): Promise<BattleState | null> {
  const key = `${BATTLE_PREFIX}${battleId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function updateBattleState(state: BattleState): Promise<void> {
  const key = `${BATTLE_PREFIX}${state.battleId}`;
  // We only update if it exists to avoid creating zombie battles
  const exists = await redis.exists(key);
  if (exists) {
    await redis.set(key, JSON.stringify(state), "EX", TTL_SECONDS);
  }
}

export async function deleteBattleState(battleId: string): Promise<void> {
  await redis.del(`${BATTLE_PREFIX}${battleId}`);
}
