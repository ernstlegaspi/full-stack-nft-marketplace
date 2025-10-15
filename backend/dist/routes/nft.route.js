"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nft;
const nft_controller_1 = require("../controller/nft.controller");
const nftRequiredFields = [
    'attributes',
    'backgroundColor',
    'collection',
    'contractAddress',
    'description',
    'imageUrl',
    'metadataUrl',
    'name',
    'nameSlug'
];
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
};
const requiredDisplayedTokens = [
    '_id',
    'backgroundColor',
    'description',
    'imageUrl',
    'metadataUrl',
    'name',
    'nameSlug',
    'ownerAddress',
    'price',
    'tokenId'
];
const propDisplayedTokens = {
    _id: { type: 'string' },
    backgroundColor: { type: 'string' },
    description: { type: 'string' },
    imageUrl: { type: 'string' },
    metadataUrl: { type: 'string' },
    name: { type: 'string' },
    nameSlug: { type: 'string' },
    ownerAddress: { type: 'string' },
    price: { type: 'string' },
    tokenId: { type: 'number' }
};
const objectIdSchema = {
    type: 'string',
    pattern: '^[a-fA-F0-9]{24}$',
    minLength: 24,
    maxLength: 24
};
const solidityAddressSchema = {
    type: 'string',
    pattern: '^0x[a-fA-F0-9]{40}$',
    minLength: 42,
    maxLength: 42
};
function nft(f) {
    f.route({
        method: 'POST',
        url: 'mint',
        schema: {
            body: {
                type: 'object',
                additionalProperties: false,
                required: [
                    'price',
                    ...nftRequiredFields
                ],
                properties: {
                    attributes: nftAttributesField,
                    collection: { type: 'string', minLength: 3 },
                    contractAddress: solidityAddressSchema,
                    backgroundColor: {
                        type: 'string',
                        pattern: '^#[a-fA-F0-9]{6}$',
                        minLength: 7,
                        maxLength: 7
                    },
                    description: { type: 'string', minLength: 8 },
                    imageUrl: { type: 'string' },
                    metadataUrl: { type: 'string' },
                    name: { type: 'string', minLength: 2 },
                    nameSlug: { type: 'string', minLength: 2 },
                    price: { type: 'string' }
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
                                'ownerAddress',
                                'tokenId',
                                'price',
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
                                price: { type: 'integer' },
                                tokenId: { type: 'integer' }
                            }
                        }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, nft_controller_1.mintNFT)(f)
    });
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
                                required: requiredDisplayedTokens,
                                properties: propDisplayedTokens
                            }
                        }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, nft_controller_1.getAllUserNFT)(f)
    });
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
                                '_id',
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
                                _id: { type: 'string' },
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
        handler: (0, nft_controller_1.getTokenPerName)(f)
    });
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
        handler: (0, nft_controller_1.searchNFT)(f)
    });
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
                                required: requiredDisplayedTokens,
                                properties: propDisplayedTokens
                            }
                        }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, nft_controller_1.getAllTokens)(f)
    });
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
                                required: requiredDisplayedTokens,
                                type: 'object',
                                properties: propDisplayedTokens
                            }
                        }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, nft_controller_1.getNFTsBySearch)(f)
    });
    f.route({
        method: 'DELETE',
        url: '',
        schema: {
            body: {
                type: 'object',
                additionalProperties: false,
                required: ['_id'],
                properties: {
                    _id: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['ok', 'data'],
                    properties: {
                        ok: { type: 'boolean' },
                        data: {
                            additionalProperties: false,
                            type: 'object',
                            required: ['message', 'token'],
                            properties: {
                                message: { type: 'string' },
                                token: { type: 'string' }
                            }
                        }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, nft_controller_1.burnNFT)(f)
    });
    f.route({
        method: 'PATCH',
        url: 'transfer',
        schema: {
            body: {
                additionalProperties: false,
                type: 'object',
                required: ['tokenId', 'newOwnerAddress'],
                properties: {
                    tokenId: { type: 'number' },
                    newOwnerAddress: solidityAddressSchema
                }
            },
            response: {
                200: {
                    additionalProperties: false,
                    type: 'object',
                    required: ['ok', 'message'],
                    properties: {
                        ok: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, nft_controller_1.transferNFT)(f)
    });
    f.route({
        method: 'PATCH',
        url: 'buy',
        schema: {
            body: {
                additionalProperties: false,
                required: ['tokenId'],
                type: 'object',
                properties: {
                    tokenId: { type: 'number' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['ok'],
                    properties: {
                        ok: { type: 'boolean' }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, nft_controller_1.buyNFT)(f)
    });
}
