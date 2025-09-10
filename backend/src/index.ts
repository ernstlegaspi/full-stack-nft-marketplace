import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import Fastify from 'fastify'
import mongoose from 'mongoose'

import jwtPlugin from './plugins/jwt'
import redisPlugin from './plugins/redis'
import userRoutes from './routes/user.route'

(async () => {
  dotenv.config()

  const app = Fastify({
    ajv: {
      customOptions: {
        coerceTypes: false,
        allErrors: true
      }
    },
    logger: true
  })

  app.register(jwtPlugin)
  app.register(redisPlugin)

  app.register(cors, {
    credentials: true,
    origin: 'http://localhost:3000'
  })

  app.register(cookie, {
    secret: process.env.COOKIE_SECRET!,
    hook: 'onRequest'
  })

  app.addSchema({
    $id: 'ErrorResponse',
    type: 'object',
    required: ['message', 'ok'],
    properties: {
      message: { type: 'string' },
      ok: { type: 'boolean' }
    }
  })

  app.register(userRoutes, { prefix: '/api/user/' })

  try {
    const PORT = process.env.PORT || 2217

    await mongoose.connect(process.env.DATABASE_URI!)
    await app.listen({ port: Number(PORT) })

    console.log(`Server is running in port: ${PORT}`)
  } catch(e) {
    app.log.error(e)
  }
})()
