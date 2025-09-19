import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import Fastify from 'fastify'
import mongoose from 'mongoose'
import multipart from '@fastify/multipart'

import jwtPlugin from './plugins/jwt'
import redisPlugin from './plugins/redis'
import nftRoutes from './routes/nft.route'
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

  app.register(multipart)

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
    additionalProperties: false,
    required: ['ok', 'message'],
    properties: {
      ok: { type: 'boolean' },
      message: { type: 'string' }
    }
  })

  app.setErrorHandler((err, req, rep) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500
    rep.code(status).send({ ok: false, message: err.message || 'Internal Server Error.' })
  })

  app.register(nftRoutes, { prefix: '/api/nft/' })
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
