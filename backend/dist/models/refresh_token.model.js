"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    jti: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    revokedAt: Date,
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});
exports.default = (0, mongoose_1.model)('Refresh Token', refreshTokenSchema);
