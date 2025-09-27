import type { FastifyInstance } from 'fastify'
import { getAllTokens, getAllUserNFT, getNFTsBySearch, getTokenPerName, mintNFT, searchNFT } from '../controller/nft.controller'

const nftRequiredFields = [
  'attributes',
  'backgroundColor',
  'collection',
  'contractAddress',
  'description',
  'imageUrl',
  'metadataUrl',
  'name',
  'nameSlug',
  'ownerAddress'
] as const

const nftAttributesField = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    required: ['trait_type', 'value'],
    additionalProperties: false,
    properties: {
      trait_type: { type: 'string', minLength: 1 },
      value: { type: 'string' }
    }
  }
} as const

export default function nft(f: FastifyInstance) {
  f.route({
    method: 'POST',
    url: 'mint',
    schema: {
      body: {
        type: 'object',
        additionalProperties: false,
        required: nftRequiredFields,
        properties: {
          attributes: nftAttributesField,
          collection: { type: 'string', minLength: 3 },
          contractAddress: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            minLength: 42,
            maxLength: 42
          },
          backgroundColor: {
            type: 'string',
            pattern: '^#[a-fA-F0-9]{6}$',
            minLength: 7,
            maxLength: 7
          },
          description: { type: 'string', minLength: 8 },
          imageUrl: { type: 'string', format: 'uri' },
          metadataUrl: { type: 'string' },
          name: { type: 'string', minLength: 2 },
          nameSlug: { type: 'string', minLength: 2 },
          ownerAddress: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            minLength: 42,
            maxLength: 42
          }
        }
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          required: ['ok', 'nft'],
          properties: {
            ok: { type: 'boolean' },
            nft: {
              type: 'object',
              additionalProperties: false,
              required: [
                '_id',
                'creator',
                'ownerId',
                'tokenId',
                ...nftRequiredFields
              ],
              properties: {
                _id: { type: 'string' },
                attributes: nftAttributesField,
                backgroundColor: { type: 'string' },
                collection: { type: 'string' },
                contractAddress: { type: 'string' },
                creator: { type: 'string' },
                description: { type: 'string' },
                imageUrl: { type: 'string' },
                metadataUrl: { type: 'string' },
                name: { type: 'string' },
                nameSlug: { type: 'string' },
                ownerAddress: { type: 'string' },
                ownerId: { type: 'string' },
                tokenId: { type: 'integer' }
              }
            }
          }
        },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    preHandler: [f.authenticate],
    handler: mintNFT(f)
  })

  f.route({
    method: 'GET',
    url: 'all/user/:page',
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['page'],
        properties: {
          page: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['cached', 'hasMore', 'nfts'],
          properties: {
            cached: { type: 'boolean' },
            hasMore: { type: 'boolean' },
            nfts: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'backgroundColor',
                  'description',
                  'imageUrl',
                  'name',
                  'nameSlug',
                  'tokenId'
                ],
                properties: {
                  backgroundColor: { type: 'string' },
                  description: { type: 'string' },
                  imageUrl: { type: 'string' },
                  name: { type: 'string' },
                  nameSlug: { type: 'string' },
                  tokenId: { type: 'number' }
                }
              }
            }
          }
        },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    preHandler: [f.authenticate],
    handler: getAllUserNFT(f)
  })

  f.route({
    method: 'GET',
    url: 'token/:tokenName',
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['tokenName'],
        properties: {
          tokenName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['cached', 'nft'],
          properties: {
            cached: { type: 'boolean' },
            nft: {
              type: 'object',
              additionalProperties: false,
              required: [
                'attributes',
                'backgroundColor',
                'collection',
                'contractAddress',
                'creator',
                'createdAt',
                'description',
                'imageUrl',
                'metadataUrl',
                'name',
                'nameSlug',
                'ownerId',
                'tokenId'
              ],
              properties: {
                attributes: nftAttributesField,
                backgroundColor: { type: 'string' },
                collection: { type: 'string' },
                contractAddress: { type: 'string' },
                creator: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['address'],
                  properties: {
                    address: { type: 'string' }
                  }
                },
                createdAt: { type: 'string', format: 'date-time' },
                description: { type: 'string' },
                imageUrl: { type: 'string' },
                metadataUrl: { type: 'string' },
                name: { type: 'string' },
                nameSlug: { type: 'string' },
                ownerId: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['address'],
                  properties: {
                    address: { type: 'string' }
                  }
                },
                tokenId: { type: 'number' }
              }
            }
          }
        },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    handler: getTokenPerName(f)
  })

  f.route({
    method: 'GET',
    url: 'search/:search',
    schema: {
      params: {
        additionalProperties: false,
        type: 'object',
        required: ['search'],
        properties: {
          search: { type: 'string', minLength: 3 }
        }
      },
      response: {
        200: {
          additionalProperties: false,
          type: 'object',
          required: ['cached', 'hasMore', 'nfts'],
          properties: {
            cached: { type: 'boolean' },
            hasMore: { type: 'boolean' },
            nfts: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['imageUrl', 'name', 'nameSlug', 'tokenId'],
                properties: {
                  imageUrl: { type: 'string' },
                  name: { type: 'string' },
                  nameSlug: { type: 'string' },
                  tokenId: { type: 'number' }
                }
              }
            }
          }
        },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    handler: searchNFT(f)
  })

  f.route({
    method: 'GET',
    url: 'all/:page',
    schema: {
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['page'],
        properties: {
          page: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['cached', 'hasMore', 'nfts'],
          properties: {
            cached: { type: 'boolean' },
            hasMore: { type: 'boolean' },
            nfts: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['backgroundColor', 'imageUrl', 'name', 'nameSlug', 'description'],
                properties: {
                  backgroundColor: { type: 'string' },
                  imageUrl: { type: 'string' },
                  name: { type: 'string' },
                  nameSlug: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    handler: getAllTokens(f)
  })

  f.route({
    method: 'GET',
    url: 'search-page/:page/:search',
    schema: {
      params: {
        additionalProperties: false,
        type: 'object',
        required: ['page', 'search'],
        properties: {
          page: { type: 'string' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['cached', 'hasMore', 'nfts'],
          properties: {
            cached: { type: 'boolean' },
            hasMore: { type: 'boolean' },
            nfts: {
              type: 'array',
              items: {
                additionalProperties: false,
                required: ['backgroundColor', 'description', 'imageUrl', 'name', 'nameSlug'],
                type: 'object',
                properties: {
                  backgroundColor: { type: 'string' },
                  description: { type: 'string' },
                  imageUrl: { type: 'string' },
                  name: { type: 'string' },
                  nameSlug: { type: 'string' }
                }
              }
            }
          }
        },
        500: { $ref: 'ErrorResponse#' }
      }
    },
    handler: getNFTsBySearch(f)
  })
}
