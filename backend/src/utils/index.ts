import type { FastifyInstance, FastifyRequest } from 'fastify'

export const decode = (f: FastifyInstance, req: FastifyRequest) => f.jwt.decode(req.cookies.token!)