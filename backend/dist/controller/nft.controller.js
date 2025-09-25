"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.burnNFT = exports.getAllTokens = exports.getNFTsBySearch = exports.searchNFT = exports.getTokenPerName = exports.getAllUserNFT = exports.mintNFT = void 0;
const nft_model_1 = __importDefault(require("../models/nft.model"));
const user_models_1 = __importDefault(require("../models/user.models"));
const http_code_1 = require("../utils/http_code");
const utils_1 = require("../utils");
const allTokensKeys = 'all:tokens';
const allUserTokensKeys = 'all:user:tokens';
const mintNFT = (f) => async (req, rep) => {
    try {
        const { attributes, backgroundColor, collection, contractAddress, description, imageUrl, metadataUrl, name, nameSlug, ownerAddress } = req.body;
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
            nameSlug,
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
        const allTokens = await f.redis.smembers(allTokensKeys);
        const allUserTokens = await f.redis.smembers(allUserTokensKeys);
        const pipe = f.redis.pipeline();
        if (allTokens.length > 0)
            pipe.del(...allTokens).srem(allTokensKeys, ...allTokens);
        if (allUserTokens.length > 0)
            pipe.del(...allUserTokens).srem(allUserTokensKeys, ...allUserTokens);
        await pipe.exec();
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
        const { page: p } = req.params;
        const page = parseInt(p);
        const { address } = (0, utils_1.decode)(f, req);
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
            select: '-ownerAddress -ownerId -contractAddress -__v',
            options: {
                limit,
                skip: (page - 1) * limit,
                sort: { createdAt: -1 }
            },
            populate: {
                path: 'creator',
                select: '-_id address'
            }
        })
            .lean();
        const mintedNFTs = nfts?.mintedNFTs ?? [];
        await f.redis.set(key, JSON.stringify(mintedNFTs), 'EX', 300);
        await f.redis.sadd(allUserTokensKeys, key);
        return rep.code(200).send({
            cached: false,
            nfts: mintedNFTs
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
                nft: JSON.parse(result)
            });
        }
        const nft = await nft_model_1.default.findOne({ nameSlug: tokenName })
            .select('-ownerAddress -__v -_id -updatedAt')
            .populate({
            path: 'creator',
            select: '-_id address'
        })
            .populate({
            path: 'ownerId',
            select: '-_id address'
        })
            .lean();
        if (!nft)
            return (0, http_code_1._404)(rep, 'no document found.');
        await f.redis.set(key, JSON.stringify(nft), 'EX', 300);
        return rep.code(200).send({
            cached: false,
            nft
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
        const { search } = req.params;
        const limit = 3;
        const key = `search:${search}:l:${limit}`;
        const result = await f.redis.get(key);
        if (result) {
            const res = JSON.parse(result);
            return rep.code(200).send({
                cached: true,
                hasMore: res.hasMore,
                nfts: res.nfts
            });
        }
        const q = {
            name: {
                $regex: search,
                $options: 'i'
            }
        };
        const [doc, total] = await Promise.all([
            nft_model_1.default.find(q)
                .select('imageUrl name nameSlug tokenId -_id')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            nft_model_1.default.countDocuments(q)
        ]);
        const hasMore = total > limit;
        const nfts = total < 1 ? [] : doc;
        await f.redis.set(key, JSON.stringify({
            hasMore,
            nfts
        }), 'EX', 300);
        return rep.code(200).send({
            cached: false,
            hasMore,
            nfts
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.searchNFT = searchNFT;
const getNFTsBySearch = (f) => async (req, rep) => {
    try {
        const { page: p, search } = req.params;
        const page = parseInt(p);
        const limit = 10;
        const q = {
            name: {
                $regex: search,
                $options: 'i'
            }
        };
        const [docs, total] = await Promise.all([
            nft_model_1.default.find(q)
                .select('-_id backgroundColor description imageUrl name nameSlug')
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean(),
            nft_model_1.default.countDocuments(q)
        ]);
        const hasMore = total > page * limit;
        const nfts = total < 1 ? [] : docs;
        return rep.code(200).send({
            cached: false,
            hasMore,
            nfts
        });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.getNFTsBySearch = getNFTsBySearch;
const getAllTokens = (f) => async (req, rep) => {
    try {
        const { page: p } = req.params;
        const page = parseInt(p);
        if (page === 0)
            return (0, http_code_1._400)(rep, 'invalid page.');
        const limit = 9;
        const key = `all:p:${page}:l:${limit}`;
        const result = await f.redis.get(key);
        if (result) {
            const parsedResult = JSON.parse(result);
            return rep.code(200).send({ cached: true, hasMore: parsedResult.hasMore, nfts: parsedResult.nfts });
        }
        const skip = (page - 1) * limit;
        const [doc, total] = await Promise.all([
            nft_model_1.default.find()
                .select('-_id backgroundColor imageUrl name nameSlug description')
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .lean(),
            nft_model_1.default.estimatedDocumentCount()
        ]);
        const hasMore = total > (skip + limit);
        const nfts = doc ?? [];
        await f.redis.set(key, JSON.stringify({
            nfts,
            hasMore
        }), 'EX', 300);
        await f.redis.sadd(allTokensKeys, key);
        return rep.code(200).send({ cached: false, hasMore, nfts });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.getAllTokens = getAllTokens;
const burnNFT = (f) => async (req, rep) => {
    try {
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.burnNFT = burnNFT;
