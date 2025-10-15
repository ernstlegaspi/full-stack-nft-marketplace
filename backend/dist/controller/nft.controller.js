"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyNFT = exports.transferNFT = exports.burnNFT = exports.getAllTokens = exports.getNFTsBySearch = exports.searchNFT = exports.getTokenPerName = exports.getAllUserNFT = exports.mintNFT = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const nft_model_1 = __importDefault(require("../models/nft.model"));
const user_models_1 = __importDefault(require("../models/user.models"));
const http_code_1 = require("../utils/http_code");
const utils_1 = require("../utils");
const allTokensKeys = 'all:tokens';
const allUserTokensKeys = 'all:user:tokens';
const searchPageTokensKey = 'search-page:tokens';
const deleteFetchCache = async (f) => {
    const allTokens = await f.redis.smembers(allTokensKeys);
    const allUserTokens = await f.redis.smembers(allUserTokensKeys);
    const allSearchPageTokens = await f.redis.smembers(searchPageTokensKey);
    const pipe = f.redis.pipeline();
    if (allTokens.length > 0)
        pipe.del(...allTokens).srem(allTokensKeys, ...allTokens);
    if (allUserTokens.length > 0)
        pipe.del(...allUserTokens).srem(allUserTokensKeys, ...allUserTokens);
    if (allSearchPageTokens)
        pipe.del(...allSearchPageTokens).srem(searchPageTokensKey, ...allSearchPageTokens);
    await pipe.exec();
};
const mintNFT = (f) => async (req, rep) => {
    try {
        const { attributes, backgroundColor, collection, contractAddress, description, imageUrl, metadataUrl, name, nameSlug, price } = req.body;
        const { address, sub: userId } = (0, utils_1.decode)(f, req);
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
            price,
            ownerAddress: address,
            ownerId: userId,
            tokenId
        });
        await user_models_1.default.findByIdAndUpdate(userId, [
            {
                $set: {
                    accountBalance: {
                        $toString: {
                            $subtract: [
                                {
                                    $convert: {
                                        input: '$accountBalance',
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                },
                                {
                                    $convert: {
                                        input: price,
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            ]
                        }
                    },
                    mintedNFTs: { $setUnion: ['$mintedNFTs', [nft._id]] },
                    ownedNFTs: { $setUnion: ['$ownedNFTs', [nft._id]] }
                }
            }
        ]);
        const { createdAt, updatedAt, ...rest } = nft.toObject();
        await deleteFetchCache(f);
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
        const limit = 10;
        const key = `all:${address}:p:${page}:l:${limit}`;
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
            ownerAddress: address
        };
        const [docs, total] = await Promise.all([
            nft_model_1.default.find(q)
                .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress tokenId')
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean(),
            nft_model_1.default.countDocuments(q)
        ]);
        const hasMore = total > page * limit;
        const nfts = total < 1 ? [] : docs;
        await f.redis.set(key, JSON.stringify({
            hasMore,
            nfts
        }), 'EX', 300);
        await f.redis.sadd(allUserTokensKeys, key);
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
            .select('-ownerAddress -__v -updatedAt')
            .populate({
            path: 'creator',
            select: '-_id address',
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
        const key = `search-page:p:${page}:s:${search}`;
        const result = await f.redis.get(key);
        if (result) {
            const res = JSON.parse(result);
            return rep.code(200).send({
                cached: true,
                hasMore: res.hasMore,
                nfts: res.nfts
            });
        }
        const limit = 10;
        const q = {
            name: {
                $regex: search,
                $options: 'i'
            }
        };
        const [docs, total] = await Promise.all([
            nft_model_1.default.find(q)
                .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress tokenId')
                .limit(limit)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean(),
            nft_model_1.default.countDocuments(q)
        ]);
        const hasMore = total > page * limit;
        const nfts = total < 1 ? [] : docs;
        await f.redis.set(key, JSON.stringify({
            hasMore,
            nfts
        }), 'EX', 300);
        await f.redis.sadd(searchPageTokensKey, key);
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
                .select('_id backgroundColor description imageUrl metadataUrl name nameSlug ownerAddress price tokenId')
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
        // _id = token object id
        const { _id } = req.body;
        const deletedNFT = await nft_model_1.default.findOneAndDelete({ _id });
        const { sub: userId } = (0, utils_1.decode)(f, req);
        if (!deletedNFT)
            return (0, http_code_1._400)(rep, 'NFT Token not existing.');
        await user_models_1.default.findOneAndUpdate({
            _id: userId
        }, {
            $addToSet: {
                burnedNFTs: _id
            }
        });
        await deleteFetchCache(f);
        return rep.code(200).send({ ok: true, data: {
                message: 'Token Delete',
                token: deletedNFT
            } });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.burnNFT = burnNFT;
const transferNFT = (f) => async (req, rep) => {
    try {
        // _id = token _id
        const { tokenId, newOwnerAddress } = req.body;
        const token = await nft_model_1.default.findOne({ tokenId }).select('_id ownerAddress').lean();
        if (!token)
            return (0, http_code_1._400)(rep, 'No existing token with that ID');
        const _id = token._id;
        const { address: currentOwnerAddress, sub: currentOwnerId } = (0, utils_1.decode)(f, req);
        if (token.ownerAddress !== currentOwnerAddress)
            return (0, http_code_1._401)(rep, 'You do not own this token.');
        const oldUser = await user_models_1.default.findOneAndUpdate({ _id: currentOwnerId }, { $pull: { ownedNFTs: _id } });
        if (!oldUser)
            return (0, http_code_1._400)(rep, 'Unable to find old user. Try again later.');
        const newOwner = await user_models_1.default.findOneAndUpdate({ address: newOwnerAddress }, { $addToSet: { ownedNFTs: _id } })
            .select('_id')
            .lean();
        if (!newOwner)
            return (0, http_code_1._400)(rep, 'Unable to find new user. Try again later.');
        const updateToken = await nft_model_1.default.findOneAndUpdate({ _id }, {
            $set: {
                ownerAddress: newOwnerAddress,
                ownerId: newOwner._id
            }
        }, { new: true });
        if (!updateToken)
            return (0, http_code_1._400)(rep, 'Unable to find token. Try again later.');
        return rep.code(200).send({ ok: true, message: 'Transfer complete!' });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.transferNFT = transferNFT;
const buyNFT = (f) => async (req, rep) => {
    let session = null;
    try {
        // addtoset to sold nfts to seller
        // pull token to ownedNfts to seller
        // set ownerAddress to newOwnerAddress as well as ownerId
        // subtract price to buyer's account balance
        const { tokenId: _id } = req.body;
        session = await mongoose_1.default.startSession();
        session.startTransaction();
        const token = await nft_model_1.default.findOne({ tokenId: _id })
            .select('_id ownerAddress price')
            .lean();
        if (!token) {
            await session.abortTransaction();
            return (0, http_code_1._400)(rep, 'No existing token with that ID');
        }
        const tokenObjectId = token._id;
        const sellerAddress = token.ownerAddress;
        const seller = await user_models_1.default.findOneAndUpdate({ address: sellerAddress }, [
            {
                $set: {
                    accountBalance: {
                        $toString: {
                            $add: [
                                {
                                    $convert: {
                                        input: '$accountBalance',
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                },
                                {
                                    $convert: {
                                        input: token.price,
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            ]
                        }
                    },
                    soldNFTs: { $setUnion: ['$soldNFTs', [tokenObjectId]] },
                    ownedNFTs: {
                        $filter: {
                            input: '$ownedNFTs',
                            as: 'id',
                            cond: { $ne: ['$$id', tokenObjectId] }
                        }
                    }
                }
            }
        ], { new: true, session });
        if (!seller) {
            await session.abortTransaction();
            return (0, http_code_1._400)(rep, 'Unable to buy token. Try again later.');
        }
        const { address: buyerAddress, sub: buyerId } = (0, utils_1.decode)(f, req);
        const buyer = await user_models_1.default.findOneAndUpdate({ _id: buyerId }, [
            {
                $set: {
                    ownedNFTs: {
                        $setUnion: ['$ownedNFTs', [tokenObjectId]]
                    },
                    accountBalance: {
                        $toString: {
                            $subtract: [
                                {
                                    $convert: {
                                        input: '$accountBalance',
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                },
                                {
                                    $convert: {
                                        input: token.price,
                                        to: 'decimal',
                                        onError: 0,
                                        onNull: 0
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ], { new: true, session });
        if (!buyer) {
            await session.abortTransaction();
            return (0, http_code_1._400)(rep, 'Unable to buy token. Try again later.');
        }
        const _token = await nft_model_1.default.findOneAndUpdate({ _id: tokenObjectId }, {
            $set: {
                ownerAddress: buyerAddress,
                ownerId: buyerId
            }
        }, { new: true, session })
            .select('description imageUrl name nameSlug tokenId')
            .lean();
        if (!_token) {
            await session.abortTransaction();
            return (0, http_code_1._400)(rep, 'Unable to buy token. Try again later.');
        }
        await session.commitTransaction();
        session.endSession();
        await deleteFetchCache(f);
        return rep.code(200).send({ ok: true });
    }
    catch (e) {
        if (session)
            await session.abortTransaction();
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.buyNFT = buyNFT;
