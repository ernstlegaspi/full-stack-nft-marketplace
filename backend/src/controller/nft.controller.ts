import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import NFT from '../models/nft.model'
import User from '../models/user.models'
import { _400, _404, _500 } from '../utils/http_code'
import { decode } from '../utils'

type TMintNFT = {
  attributes: [
    {
      trait_type: string
      value: string | number | boolean
    }
  ]
  backgroundColor: string
  collection: string
  contractAddress: string
  description: string
  imageUrl: string
  metadataUrl: string
  name: string
  nameSlug: string
  ownerAddress: string
}

const allTokensKeys = 'all:tokens'
const allUserTokensKeys = 'all:user:tokens'

export const mintNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: TMintNFT }>, rep: FastifyReply) => {
  try {
    const {
      attributes,
      backgroundColor,
      collection,
      contractAddress,
      description,
      imageUrl,
      metadataUrl,
      name,
      nameSlug,
      ownerAddress
    } = req.body

    const { sub: userId } = f.jwt.decode(req.cookies.token!) as { sub: string }
    const tokenId = await f.redis.incr(contractAddress)

    const nft = await NFT.create({
      attributes,
      backgroundColor,
      collection,
      contractAddress,
      creator: userId,
      description,
      imageUrl,
      metadataUrl,
      name,
      nameSlug,
      ownerAddress,
      ownerId: userId,
      tokenId
    })

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          mintedNFTs: nft._id
        }
      }
    )

    const { createdAt, updatedAt, ...rest } = nft.toObject()

    const allTokens = await f.redis.smembers(allTokensKeys)
    const allUserTokens = await f.redis.smembers(allUserTokensKeys)
    const pipe = f.redis.pipeline()

    if(allTokens.length > 0) pipe.del(...allTokens).srem(allTokensKeys, ...allTokens)
    if(allUserTokens.length > 0) pipe.del(...allUserTokens).srem(allUserTokensKeys, ...allUserTokens)

    await pipe.exec()

    return rep.code(201).send({
      ok: true,
      nft: { ...rest }
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getAllUserNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { page: string } }>, rep: FastifyReply) => {
  try {
    const { page: p } = req.params
    const page = parseInt(p)

    const { address } = decode(f, req) as { address: string }
    const limit = 20
    const key = `all:${address}:p:${page}:l:${limit}`

    const result = await f.redis.get(key)

    if(result) {
      return rep.code(200).send({
        cached: true,
        nfts: JSON.parse(result)
      })
    }

    const nfts = await User.findOne({ address })
    .select('mintedNFTs -_id')
    .populate({
      path: 'mintedNFTs',
      select: '-ownerAddress -ownerId -contractAddress -__v',
      options: {
        limit,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
      },
      populate: {
        path: 'creator',
        select: '-_id address'
      }
    })
    .lean()
    const mintedNFTs = nfts?.mintedNFTs ?? []

    await f.redis.set(
      key,
      JSON.stringify(mintedNFTs),
      'EX',
      300
    )

    await f.redis.sadd(allUserTokensKeys, key)

    return rep.code(200).send({
      cached: false,
      nfts: mintedNFTs
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getTokenPerName = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { tokenName: string } }>, rep: FastifyReply) => {
  try {
    const { tokenName } = req.params

    const key = `token:${tokenName}`
    const result = await f.redis.get(key)

    if(result) {
      return rep.code(200).send({
        cached: true,
        nft: JSON.parse(result)
      })
    }

    const nft = await NFT.findOne({ nameSlug: tokenName })
    .select('-ownerAddress -__v -_id -updatedAt')
    .populate({
      path: 'creator',
      select: '-_id address'
    })
    .populate({
      path: 'ownerId',
      select: '-_id address'
    })
    .lean()

    if(!nft) return _404(rep, 'no document found.')

    await f.redis.set(
      key,
      JSON.stringify(nft),
      'EX',
      300
    )

    return rep.code(200).send({
      cached: false,
      nft
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const searchNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { search: string } }>, rep: FastifyReply) => {
  try {
    const { search } = req.params

    const limit = 3
    const key = `search:${search}:l:${limit}`
    const result = await f.redis.get(key)

    if(result) {
      const res = JSON.parse(result)
      
      return rep.code(200).send({
        cached: true,
        hasMore: res.hasMore,
        nfts: res.nfts
      })
    }

    const q = {
      name: {
        $regex: search,
        $options: 'i'
      }
    }

    const [doc, total] = await Promise.all([
      NFT.find(q)
      .select('imageUrl name nameSlug tokenId -_id')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
      NFT.countDocuments(q)
    ])

    const hasMore = total > limit
    const nfts = total < 1 ? [] : doc

    await f.redis.set(
      key,
      JSON.stringify({
        hasMore,
        nfts
      }),
      'EX',
      300
    )

    return rep.code(200).send({
      cached: false,
      hasMore,
      nfts
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getNFTsBySearch = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { page: string, search: string } }>, rep: FastifyReply) => {
  try {
    const { page: p, search } = req.params
    const page = parseInt(p)

    const limit = 10
    const q = {
      name: {
        $regex: search,
        $options: 'i'
      }
    }

    const [docs, total] = await Promise.all([
      NFT.find(q)
      .select('-_id backgroundColor description imageUrl name nameSlug')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(),
      NFT.countDocuments(q)
    ])

    const hasMore = total > page * limit
    const nfts = total < 1 ? [] : docs

    return rep.code(200).send({
      cached: false,
      hasMore,
      nfts
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getAllTokens = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { page: string } }>, rep: FastifyReply) => {
  try {
    const { page: p } = req.params
    const page = parseInt(p)

    if(page === 0) return _400(rep, 'invalid page.')

    const limit = 9
    const key = `all:p:${page}:l:${limit}`

    const result = await f.redis.get(key)

    if(result) {
      const parsedResult = JSON.parse(result)

      return rep.code(200).send({ cached: true, hasMore: parsedResult.hasMore, nfts: parsedResult.nfts })
    }

    const skip = (page - 1) * limit

    const [doc, total] = await Promise.all([
      NFT.find()
      .select('-_id backgroundColor imageUrl name nameSlug description')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean(),
      NFT.estimatedDocumentCount()
    ])

    const hasMore = total > (skip + limit)
    const nfts = doc ?? []

    await f.redis.set(
      key,
      JSON.stringify({
        nfts,
        hasMore
      }),
      'EX',
      300
    )

    await f.redis.sadd(allTokensKeys, key)

    return rep.code(200).send({ cached: false, hasMore, nfts })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const burnNFT = (f: FastifyInstance) => async (req: FastifyRequest, rep: FastifyReply) => {
  try {
    
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}
