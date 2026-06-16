import { createClient } from 'redis';
export const redisClient = createClient({
    url: process.env.REDIS_URL || ""
})
redisClient.on('error', (err) => console.log(err));
redisClient.on('ready', () => console.log("redis connected"));