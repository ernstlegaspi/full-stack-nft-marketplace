import type { FastifyReply } from 'fastify'

export const _400 = (rep: FastifyReply, message: string) => rep.code(400).send({ ok: false, message })
export const _401 = (rep: FastifyReply, message: string) => rep.code(401).send({ ok: false, message })
export const _404 = (rep: FastifyReply, message: string) => rep.code(404).send({ ok: false, message })

export const _500 = (rep: FastifyReply) => rep.code(500).send({ ok: false, message: 'Internal Server Error.' })