"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.burnNFT = exports.searchNFT = exports.getTokenPerName = exports.getAllUserNFT = exports.mintNFT = void 0;
const nft_model_1 = __importDefault(require("../models/nft.model"));
const user_models_1 = __importDefault(require("../models/user.models"));
const http_code_1 = require("../utils/http_code");
const mintNFT = (f) => async (req, rep) => {
    try {
        const { attributes, backgroundColor, collection, contractAddress, description, imageUrl, metadataUrl, name, ownerAddress } = req.body;
        const { sub: userId } = f.jwt.decode(req.cookies.token);
        const tokenId = await f.redis.incr(contractAddress);
        const nft = await nft_model_1.default.create({
            attributes,
            backgroundColor,
            collection,
            contractAddress,
            creator: userId,
            description,
            imageUrl,
            metadataUrl,
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
        await f.redis.del(`all:${ownerAddress}`);
        return rep.code(201).send({
            ok: true,
            nft: { ...rest }
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.mintNFT = mintNFT;
const getAllUserNFT = (f) => async (req, rep) => {
    try {
        const { address, page } = req.params;
        const limit = 20;
        const key = `all:${address}:p:${page}:l:${limit}`;
        const result = await f.redis.get(key);
        if (result) {
            return rep.code(200).send({
                cached: true,
                nfts: JSON.parse(result)
            });
        }
        const nfts = await user_models_1.default.findOne({ address })
            .select('mintedNFTs -_id')
            .populate({
            path: 'mintedNFTs',
            select: '-ownerAddress -ownerId -contractAddress',
            options: {
                limit,
                skip: (page - 1) * limit,
                sort: { createdAt: -1 }
            },
            populate: {
                path: 'creator',
                select: '-_id address name'
            }
        })
            .lean();
        if (!nfts) {
            await f.redis.set(key, JSON.stringify([]), 'EX', 300);
            return rep.code(200).send({
                cached: false,
                nfts: []
            });
        }
        await f.redis.set(key, JSON.stringify(nfts), 'EX', 300);
        return rep.code(200).send({
            cached: false,
            nfts
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.getAllUserNFT = getAllUserNFT;
const getTokenPerName = (f) => async (req, rep) => {
    try {
        const { tokenName } = req.params;
        const key = `token:${tokenName}`;
        const result = await f.redis.get(key);
        if (result) {
            return rep.code(200).send({
                cached: true,
                nfts: JSON.parse(result)
            });
        }
        const nfts = await nft_model_1.default.findOne({ name: tokenName })
            .select('-ownerAddress')
            .populate({
            path: 'creator',
            select: '-_id address name'
        })
            .populate({
            path: 'ownerId',
            select: '-_id address name'
        })
            .lean();
        if (!nfts) {
            await f.redis.set(key, JSON.stringify([]), 'EX', 300);
            return rep.code(200).send({
                cached: false,
                nfts: []
            });
        }
        await f.redis.set(key, JSON.stringify(nfts), 'EX', 300);
        return rep.code(200).send({
            cached: false,
            nfts
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.getTokenPerName = getTokenPerName;
const searchNFT = (f) => async (req, rep) => {
    try {
        const { page, search } = req.params;
        const limit = 20;
        const key = `search:${search}:p:${page}:l:${limit}`;
        const result = await f.redis.get(key);
        if (result) {
            return rep.code(200).send({
                cached: true,
                nfts: JSON.parse(result)
            });
        }
        const nfts = await nft_model_1.default.find({
            name: {
                $regex: search,
                $options: 'i'
            }
        })
            .select('imageUrl name -_id')
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();
        if (!nfts) {
            await f.redis.set(key, JSON.stringify([]), 'EX', 300);
            return rep.code(200).send({
                cached: false,
                nfts: []
            });
        }
        await f.redis.set(key, JSON.stringify(nfts), 'EX', 300);
        return rep.code(200).send({
            cached: false,
            nfts
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.searchNFT = searchNFT;
const burnNFT = (f) => async (req, rep) => {
    try {
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.burnNFT = burnNFT;
