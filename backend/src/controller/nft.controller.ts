import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import mongoose, { type ClientSession } from 'mongoose'

import NFT from '../models/nft.model'
import User from '../models/user.models'
import { _400, _401, _404, _500 } from '../utils/http_code'
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
  price: string
}

const allTokensKeys = 'all:tokens'
const allUserTokensKeys = 'all:user:tokens'
const searchPageTokensKey = 'search-page:tokens'

const deleteFetchCache = async (f: FastifyInstance) => {
  const allTokens = await f.redis.smembers(allTokensKeys)
  const allUserTokens = await f.redis.smembers(allUserTokensKeys)
  const allSearchPageTokens = await f.redis.smembers(searchPageTokensKey)
  const pipe = f.redis.pipeline()

  if(allTokens.length > 0) pipe.del(...allTokens).srem(allTokensKeys, ...allTokens)
  if(allUserTokens.length > 0) pipe.del(...allUserTokens).srem(allUserTokensKeys, ...allUserTokens)
  if(allSearchPageTokens) pipe.del(...allSearchPageTokens).srem(searchPageTokensKey, ...allSearchPageTokens)

  await pipe.exec()
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
      nameSlug,
      price
    } = req.body

    const { address, sub: userId } = decode(f, req) as { address: string, sub: string }
    const tokenId = await f.redis.incr(contractAddress)

    const nft = await NFT.create(
      {
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
        price,
        ownerAddress: address,
        ownerId: userId,
        tokenId
      }
    )

    await User.findByIdAndUpdate(
      userId,
      [
        {
          $set: {
            accountBalance: {
              $toString: {
                $subtract: [
                  {
                    $convert: {
                      input: '$accountBalance',
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  },
                  {
                    $convert: {
                      input: price,
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  }
                ]
              }
            },
            mintedNFTs: { $setUnion: ['$mintedNFTs', [nft._id]] },
            ownedNFTs: { $setUnion: ['$ownedNFTs', [nft._id]] }
          }
        }
      ]
    )

    const { createdAt, updatedAt, ...rest } = nft.toObject()

    await deleteFetchCache(f)

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
    const limit = 10
    const key = `all:${address}:p:${page}:l:${limit}`

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
      ownerAddress: address
    }

    const [docs, total] = await Promise.all([
      NFT.find(q)
      .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress tokenId')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(),
      NFT.countDocuments(q)
    ])

    const hasMore = total > page * limit
    const nfts = total < 1 ? [] : docs

    await f.redis.set(
      key,
      JSON.stringify({
        hasMore,
        nfts
      }),
      'EX',
      300
    )

    await f.redis.sadd(allUserTokensKeys, key)

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
    .select('-ownerAddress -__v -updatedAt')
    .populate({
      path: 'creator',
      select: '-_id address',
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

    const key = `search-page:p:${page}:s:${search}`

    const result = await f.redis.get(key)

    if(result) {
      const res = JSON.parse(result)

      return rep.code(200).send({
        cached: true,
        hasMore: res.hasMore,
        nfts: res.nfts
      })
    }

    const limit = 10
    const q = {
      name: {
        $regex: search,
        $options: 'i'
      }
    }

    const [docs, total] = await Promise.all([
      NFT.find(q)
      .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress tokenId')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean(),
      NFT.countDocuments(q)
    ])

    const hasMore = total > page * limit
    const nfts = total < 1 ? [] : docs

    await f.redis.set(
      key,
      JSON.stringify({
        hasMore,
        nfts
      }),
      'EX',
      300
    )

    await f.redis.sadd(searchPageTokensKey, key)

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
      .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress price tokenId')
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

export const burnNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: { _id: string } }>, rep: FastifyReply) => {
  try {
    // _id = token object id
    const { _id } = req.body

    const deletedNFT = await NFT.findOneAndDelete({ _id })
    const { sub: userId } = decode(f, req) as { sub: string }

    if(!deletedNFT) return _400(rep, 'NFT Token not existing.')

    await User.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $addToSet: {
          burnedNFTs: _id
        }
      }
    )

    await deleteFetchCache(f)

    return rep.code(200).send({ ok: true, data: {
      message: 'Token Delete',
      token: deletedNFT
    } })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const transferNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: { newOwnerAddress: string, tokenId: number } }>, rep: FastifyReply) => {
  try {
    // _id = token _id
    const { tokenId, newOwnerAddress } = req.body

    const token = await NFT.findOne({ tokenId }).select('_id ownerAddress').lean()

    if(!token) return _400(rep, 'No existing token with that ID')

    const _id = token._id

    const { address: currentOwnerAddress, sub: currentOwnerId } = decode(f, req) as { address: string, sub: string }

    if(token.ownerAddress !== currentOwnerAddress) return _401(rep, 'You do not own this token.')

    const oldUser = await User.findOneAndUpdate(
      { _id: currentOwnerId },
      { $pull: { ownedNFTs: _id } }
    )

    if(!oldUser) return _400(rep, 'Unable to find old user. Try again later.')

    const newOwner = await User.findOneAndUpdate(
      { address: newOwnerAddress },
      { $addToSet: { ownedNFTs: _id } }
    )
    .select('_id')
    .lean()

    if(!newOwner) return _400(rep, 'Unable to find new user. Try again later.')

    const updateToken = await NFT.findOneAndUpdate(
      { _id },
      {
        $set: {
          ownerAddress: newOwnerAddress,
          ownerId: newOwner._id
        }
      },
      { new: true }
    )

    if(!updateToken) return _400(rep, 'Unable to find token. Try again later.')

    return rep.code(200).send({ ok: true, message: 'Transfer complete!' })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}

export const buyNFT = (f: FastifyInstance) => async (req: FastifyRequest<{ Body: { tokenId: number } }>, rep: FastifyReply) => {
  let session: ClientSession | null = null

  try {
    // addtoset to sold nfts to seller
    // pull token to ownedNfts to seller
    // set ownerAddress to newOwnerAddress as well as ownerId
    // subtract price to buyer's account balance

    const { tokenId: _id } = req.body

    session = await mongoose.startSession()
    session.startTransaction()

    const token = await NFT.findOne({ tokenId: _id })
    .select('_id ownerAddress price')
    .lean()

    if(!token) {
      await session.abortTransaction()

      return _400(rep, 'No existing token with that ID')
    }

    const tokenObjectId = token._id
    const sellerAddress = token.ownerAddress

    const seller = await User.findOneAndUpdate(
      { address: sellerAddress },
      [
        {
          $set: {
            accountBalance: {
              $toString: {
                $add: [
                  {
                    $convert: {
                      input: '$accountBalance',
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  },
                  {
                    $convert: {
                      input: token.price,
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  }
                ]
              }
            },
            soldNFTs: { $setUnion: ['$soldNFTs', [tokenObjectId]] },
            ownedNFTs: {
              $filter: {
                input: '$ownedNFTs',
                as: 'id',
                cond: { $ne: ['$$id', tokenObjectId] }
              }
            }
          }
        }
      ],
      { new: true, session }
    )

    if(!seller) {
      await session.abortTransaction()

      return _400(rep, 'Unable to buy token. Try again later.')
    }

    const { address: buyerAddress, sub: buyerId } = decode(f, req) as { address: string, sub: string }

    const buyer = await User.findOneAndUpdate(
      { _id: buyerId },
      [
        {
          $set: {
            ownedNFTs: {
              $setUnion: ['$ownedNFTs', [tokenObjectId]]
            },
            accountBalance: {
              $toString: {
                $subtract: [
                  {
                    $convert: {
                      input: '$accountBalance',
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  },
                  {
                    $convert: {
                      input: token.price,
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  }
                ]
              }
            }
          }
        }
      ],
      { new: true, session }
    )

    if(!buyer) {
      await session.abortTransaction()

      return _400(rep, 'Unable to buy token. Try again later.')
    }

    const _token = await NFT.findOneAndUpdate(
      { _id: tokenObjectId },
      {
        $set: {
          ownerAddress: buyerAddress,
          ownerId: buyerId
        }
      },
      { new: true, session }
    )
    .select('description imageUrl name nameSlug tokenId')
    .lean()

    if(!_token) {
      await session.abortTransaction()

      return _400(rep, 'Unable to buy token. Try again later.')
    }

    await session.commitTransaction()
    session.endSession()

    await deleteFetchCache(f)

    return rep.code(200).send({ ok: true })
  } catch(e) {
    if(session) await session.abortTransaction()

    console.error(e)
    _500(rep)
  }
}
