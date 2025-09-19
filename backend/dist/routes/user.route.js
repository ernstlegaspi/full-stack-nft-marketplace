"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = user;
const user_controller_1 = require("../controller/user.controller");
async function user(f) {
    f.route({
        method: 'GET',
        url: 'nonce',
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        nonce: { type: 'string' }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, user_controller_1.authNonce)(f)
    });
    f.route({
        method: 'POST',
        url: 'verify-signature',
        schema: {
            body: {
                additionalProperties: false,
                required: ['message', 'signature'],
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    signature: { type: 'string' }
                }
            },
            response: {
                200: {
                    additionalProperties: false,
                    type: 'object',
                    properties: {
                        address: { type: 'string' },
                        ok: { type: 'boolean' }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                401: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, user_controller_1.authVerifySignature)(f)
    });
    f.route({
        method: 'POST',
        url: '',
        schema: {
            body: {
                additionalProperties: false,
                type: 'object',
                required: ['address', 'accountBalance'],
                properties: {
                    address: {
                        pattern: '^0x[a-fA-F0-9]{40}$',
                        type: 'string',
                        minLength: 42,
                        maxLength: 42
                    },
                    accountBalance: { type: 'string' }
                }
            },
            response: {
                201: {
                    additionalProperties: false,
                    type: 'object',
                    required: ['ok'],
                    properties: {
                        ok: { type: 'boolean' }
                    }
                },
                400: { $ref: 'ErrorResponse#' },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        handler: (0, user_controller_1.handleUser)(f)
    });
    f.route({
        method: 'GET',
        url: 'authenticate',
        schema: {
            response: {
                200: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['authenticated'],
                    properties: {
                        authenticated: { type: 'boolean' }
                    }
                },
                500: { $ref: 'ErrorResponse#' }
            }
        },
        preHandler: [f.authenticate],
        handler: (0, user_controller_1.authenticateUser)(f)
    });
}
