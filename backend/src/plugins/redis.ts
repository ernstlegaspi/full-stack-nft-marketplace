import type { FastifyInstance } from 'fastify'

import fp from 'fastify-plugin'
import IORedis, { Redis } from 'ioredis'

declare module 'Fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

export default fp(async (app: FastifyInstance) => {
  const redis = new IORedis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
    {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      connectTimeout: 10_000,
      lazyConnect: false,
      retryStrategy: times => Math.min(times * 200, 2000)
    }
  )

  app.decorate('redis', redis)

  app.addHook('onClose', async () => {
    await redis.quit()
  })
})
