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
    'ownerAddress'
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
// all = address page
function nft(f) {
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
        handler: (0, nft_controller_1.mintNFT)(f)
    });
    f.route({
        method: 'GET',
        url: 'all',
        schema: {
            params: {
                type: 'object',
                additionalProperties: false,
                required: ['address', 'page'],
                properties: {
                    address: {
                        type: 'string',
                        pattern: '^0x[0-9a-fA-F]{40}$',
                        minLength: 42,
                        maxLength: 42
                    },
                    page: { type: 'number', minimum: 1 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    additionalPropertes: false,
                    required: ['cached', 'nfts'],
                    properties: {
                        cached: { type: 'boolean' },
                        nfts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                additionalProperties: false,
                                required: [
                                    'attributes',
                                    'backgroundColor',
                                    'collection',
                                    'creator',
                                    'description',
                                    'imageUrl',
                                    'metadataUrl',
                                    'name',
                                    'tokenId'
                                ],
                                properties: {
                                    attributes: nftAttributesField,
                                    backgroundColor: { type: 'string' },
                                    collection: { type: 'string' },
                                    creator: {
                                        type: 'object',
                                        additionalProperties: false,
                                        required: ['address', 'name'],
                                        properties: {
                                            address: { type: 'string' },
                                            name: { type: 'string' }
                                        }
                                    },
                                    description: { type: 'string' },
                                    imageUrl: { type: 'string' },
                                    metadataUrl: { type: 'string' },
                                    name: { type: 'string' },
                                    tokenId: { type: 'number' },
                                }
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
        url: 'token',
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
                    required: ['cached', 'nfts'],
                    properties: {
                        cached: { type: 'boolean' },
                        nfts: {
                            type: 'object',
                            additionalProperties: false,
                            required: [
                                'attributes',
                                'backgroundColor',
                                'collection',
                                'contractAddress',
                                'creator',
                                'description',
                                'imageUrl',
                                'metadataUrl',
                                'name',
                                'ownerId',
                                'tokenId'
                            ],
                            propertes: {
                                attributes: nftAttributesField,
                                backgroundColor: { type: 'string' },
                                collection: { type: 'string' },
                                contractAddress: { type: 'string' },
                                creator: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['address', 'name'],
                                    properties: {
                                        address: { type: 'string' },
                                        name: { type: 'string' }
                                    }
                                },
                                description: { type: 'string' },
                                imageUrl: { type: 'string' },
                                metadataUrl: { type: 'string' },
                                name: { type: 'string' },
                                ownerId: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['address', 'name'],
                                    properties: {
                                        address: { type: 'string' },
                                        name: { type: 'string' }
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
        url: 'search',
        schema: {
            params: {
                additionalProperties: false,
                type: 'object',
                required: ['page', 'search'],
                properties: {
                    page: { type: 'number', minimum: 1 },
                    search: { type: 'string', minLength: 3 }
                }
            },
            response: {
                200: {
                    additionalProperties: false,
                    type: 'object',
                    required: ['cached', 'nfts'],
                    properties: {
                        cached: { type: 'boolean' },
                        nfts: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['imageUrl', 'name'],
                            properties: {
                                imageUrl: { type: 'string' },
                                name: { type: 'string' }
                            }
                        }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, nft_controller_1.searchNFT)(f)
    });
}
