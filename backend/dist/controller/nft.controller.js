"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNFT = void 0;
const nft_model_1 = __importDefault(require("../models/nft.model"));
const user_models_1 = __importDefault(require("../models/user.models"));
const http_code_1 = require("../utils/http_code");
const mintNFT = (f) => async (req, rep) => {
    try {
        const { attributes, backgroundColor, collection, contractAddress, description, imageUrl, name, ownerAddress, userId } = req.body;
        const tokenId = await f.redis.incr(contractAddress);
        const nft = await nft_model_1.default.create({
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
        });
        await user_models_1.default.findByIdAndUpdate(userId, {
            $addToSet: {
                mintedNFTs: nft._id
            }
        });
        const { createdAt, updatedAt, ...rest } = nft.toObject();
        return rep.code(201).send({ ok: true, nft: { ...rest } });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.mintNFT = mintNFT;
