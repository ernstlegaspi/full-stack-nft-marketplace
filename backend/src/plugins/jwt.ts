import type { FastifyReply, FastifyRequest } from 'fastify'

import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async app => {
  app.register(jwt, { secret: process.env.JWT_SECRET! })

  app.decorate(
    'authenticate',
    async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        await req.jwtVerify()
      } catch(e) {
        rep.code(401).send({ message: 'Unauthorized.' })
      }
    }
  )
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
  }
}
