"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AttributesSchema = new mongoose_1.Schema({
    trait_type: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});
const NFTSchema = new mongoose_1.Schema({
    backgroundColor: {
        type: String,
        trim: true
    },
    contractAddress: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    metadataUrl: {
        type: String,
        trim: true
    },
    tokenId: {
        type: Number,
        required: true
    },
    attributes: [AttributesSchema],
    imageUrl: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    collection: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    ownerAddress: {
        type: String,
        required: true,
        trim: true
    },
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });
NFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true }); // same contract address and token id is not allowed on the database
NFTSchema.index({ contractAddress: 1, name: 1 }, { unique: true }); // same contract address and name is not allowed on the database
exports.default = (0, mongoose_1.model)('NFT', NFTSchema);
