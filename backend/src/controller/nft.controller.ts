import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import NFT from '../models/nft.model'
import User from '../models/user.models'
import { _500 } from '../utils/http_code'

type TMintNFT = {
  attributes: [
    {
      key: string
      value: string | number | boolean
    }
  ]
  backgroundColor: string
  collection: string
  contractAddress: string
  description: string
  imageUrl: string
  name: string
  ownerAddress: string
  userId: string // for creator and ownerId
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
      name,
      ownerAddress,
      userId
    } = req.body

    const tokenId = await f.redis.incr(contractAddress)

    const nft = await NFT.create({
      attributes,
      backgroundColor,
      collection,
      contractAddress,
      creator: userId,
      description,
      imageUrl,
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

    return rep.code(201).send({ ok: true, nft: { ...rest } })
  } catch(e) {
    console.error(e)
    _500(rep)
  }
}
