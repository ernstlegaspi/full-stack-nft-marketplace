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
    'name',
    'ownerAddress'
];
const nftAttributesField = {
    type: 'array',
    minItems: 1,
    items: {
        type: 'object',
        required: ['key', 'value'],
        additionalProperties: false,
        properties: {
            key: { type: 'string', minLength: 1 },
            value: { type: 'string' }
        }
    }
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
                    'userId',
                    ...nftRequiredFields
                ],
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
                    imageUrl: { type: 'string' },
                    // imageUrl: { type: 'string', format: 'uri' },
                    name: { type: 'string', minLength: 2 },
                    ownerAddress: {
                        type: 'string',
                        pattern: '^0x[a-fA-F0-9]{40}$',
                        minLength: 42,
                        maxLength: 42
                    },
                    userId: {
                        type: 'string',
                        pattern: '^[a-fA-F0-9]{24}$',
                        minLength: 24,
                        maxLength: 24
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
}
