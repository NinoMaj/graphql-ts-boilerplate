import { Redis } from "ioredis";
import { userSessionIdPrefix, redisSessionPrefix } from "../constants";

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionsIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1);

  const promises = [];
  for (const sessionId of sessionsIds) {
    promises.push(redis.del(`${redisSessionPrefix}${sessionId}`));
  }

  await Promise.all(promises);
}