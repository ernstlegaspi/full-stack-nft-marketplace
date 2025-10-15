"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    accountBalance: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    burnedNFTs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'NFT'
        }],
    soldNFTs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'NFT'
        }],
    mintedNFTs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'NFT'
        }],
    ownedNFTs: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'NFT'
        }]
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', userSchema);
