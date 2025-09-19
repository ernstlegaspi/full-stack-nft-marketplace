import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import NFT from '../models/nft.model'
import User from '../models/user.models'
import { _400, _500 } from '../utils/http_code'

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
  ownerAddress: string
}

type TUserParams = {
  address: string
  page: number
}

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

    await f.redis.del(`all:${ownerAddress}`)

    return rep.code(201).send({
      ok: true,
      nft: { ...rest }
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const getAllUserNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: TUserParams }>, rep: FastifyReply) => {
  try {
    const { address, page } = req.params

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
      select: '-ownerAddress -ownerId -contractAddress',
      options: {
        limit,
        skip: (page - 1) * limit,
        sort: { createdAt: -1 }
      },
      populate: {
        path: 'creator',
        select: '-_id address name'
      }
    })
    .lean()

    if(!nfts) {
      await f.redis.set(
        key,
        JSON.stringify([]),
        'EX',
        300
      )

      return rep.code(200).send({
        cached: false,
        nfts: []
      })
    }

    await f.redis.set(
      key,
      JSON.stringify(nfts),
      'EX',
      300
    )

    return rep.code(200).send({
      cached: false,
      nfts
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
        nfts: JSON.parse(result)
      })
    }

    const nfts = await NFT.findOne(
      { name: tokenName }
    )
    .select('-ownerAddress')
    .populate({
      path: 'creator',
      select: '-_id address name'
    })
    .populate({
      path: 'ownerId',
      select: '-_id address name'
    })
    .lean()

    if(!nfts) {
      await f.redis.set(
        key,
        JSON.stringify([]),
        'EX',
        300
      )

      return rep.code(200).send({
        cached: false,
        nfts: []
      })
    }

    await f.redis.set(
      key,
      JSON.stringify(nfts),
      'EX',
      300
    )

    return rep.code(200).send({
      cached: false,
      nfts
    })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const searchNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Params: { page: number, search: string } }>, rep: FastifyReply) => {
  try {
    const { page, search } = req.params

    const limit = 20
    const key = `search:${search}:p:${page}:l:${limit}`
    const result = await f.redis.get(key)

    if(result) {
      return rep.code(200).send({
        cached: true,
        nfts: JSON.parse(result)
      })
    }

    const nfts = await NFT.find({
      name: {
        $regex: search,
        $options: 'i'
      }
    })
    .select('imageUrl name -_id')
    .limit(limit)
    .skip((page - 1) * limit)
    .lean()

    if(!nfts) {
      await f.redis.set(
        key,
        JSON.stringify([]),
        'EX',
        300
      )

      return rep.code(200).send({
        cached: false,
        nfts: []
      })
    }

    await f.redis.set(
      key,
      JSON.stringify(nfts),
      'EX',
      300
    )

    return rep.code(200).send({
      cached: false,
      nfts
    })
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
