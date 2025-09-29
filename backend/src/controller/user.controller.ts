import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { randomUUID } from 'crypto'
import { SiweMessage, generateNonce } from 'siwe'

import User from '../models/user.models'
import RefreshToken from '../models/refresh_token.model'
import { _400, _401, _500 } from '../utils/http_code'
import { decode } from '../utils'

type TUser = {
  address: string
  accountBalance: string
}

type TAuthSignature = {
  message: string
  signature: string
}

const tokenTime: string = '30m' // 30 mins default, can change to lower timeframe for dev testing

const expiresIn7Days = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

const setCookie = (rep: FastifyReply, refreshToken: string) => rep.setCookie(
  'refresh_token',
  refreshToken,
  {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/api/user/refresh',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
)

export const authNonce = (f: FastifyInstance) => async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    const nonce = generateNonce()

    await f.redis.set(`nonce:${nonce}`, nonce, 'EX', 300)

    return rep.code(200).send({ nonce })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const authVerifySignature = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: TAuthSignature }>, rep: FastifyReply) => {
  try {
    const { message, signature } = req.body

    if(!message || !signature) return _400(rep, 'all fields are required.')

    const siwe = new SiweMessage(message)
    const domain = req.hostname
    const { success } = await siwe.verify({
      signature,
      domain
    })

    if(!success) return _401(rep, 'invalid signature.')

    const key = `nonce:${siwe.nonce}`
    const result = await f.redis.get(key)

    if(!result) return _401(rep, 'invalid nonce.')

    await f.redis.del(key)

    return rep.code(200).send({ ok: true, address: siwe.address })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const handleUser = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: TUser }>, rep: FastifyReply) => {
  try {
    const { address, accountBalance } = req.body

    if(!address || !accountBalance) return _400(rep, 'all fields are required.')

    const jti = randomUUID()

    let user = await User.findOne({ address })

    if(!user) user = await User.create({ address, accountBalance })

    const sub = user._id

    await RefreshToken.create({
      expiresAt: expiresIn7Days(),
      jti,
      user: sub
    })

    const refreshToken = f.jwt.sign(
      {
        jti,
        sub
      },
      { expiresIn: '7d' }
    )

    setCookie(rep, refreshToken)

    const token = f.jwt.sign(
      { sub, address },
      { expiresIn: tokenTime }
    )

    rep.setCookie(
      'token',
      token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30,
        path: '/'
      }
    )

    return rep.code(201).send({ ok: true })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const authenticateUser = (f: FastifyInstance) => async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    return rep.code(200).send({ authenticated: true })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getUserAddress = (f: FastifyInstance) => async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    const { address } = decode(f, req) as { address: string }

    return rep.code(200).send({ address })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

// implement refresh token controller
