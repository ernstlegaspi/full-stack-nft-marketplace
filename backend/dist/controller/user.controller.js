"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUser = exports.authVerifySignature = exports.authNonce = void 0;
const crypto_1 = require("crypto");
const siwe_1 = require("siwe");
const user_models_1 = __importDefault(require("../models/user.models"));
const refresh_token_model_1 = __importDefault(require("../models/refresh_token.model"));
const http_code_1 = require("../utils/http_code");
const tokenTime = '30m'; // 30 mins default, can change to lower timeframe for dev testing
const expiresIn7Days = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const setCookie = (rep, refreshToken) => rep.setCookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/api/user/refresh',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
});
const authNonce = (f) => async (req, rep) => {
    try {
        const nonce = (0, siwe_1.generateNonce)();
        await f.redis.set(`nonce:${nonce}`, nonce, 'EX', 300);
        return rep.code(200).send({ nonce });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.authNonce = authNonce;
const authVerifySignature = (f) => async (req, rep) => {
    try {
        const { message, signature } = req.body;
        if (!message || !signature)
            return (0, http_code_1._400)(rep, 'all fields are required.');
        const siwe = new siwe_1.SiweMessage(message);
        const domain = req.hostname;
        const { success } = await siwe.verify({
            signature,
            domain
        });
        if (!success)
            return (0, http_code_1._401)(rep, 'invalid signature.');
        const key = `nonce:${siwe.nonce}`;
        const result = await f.redis.get(key);
        if (!result)
            return (0, http_code_1._401)(rep, 'invalid nonce.');
        await f.redis.del(key);
        return rep.code(200).send({ ok: true, address: siwe.address });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.authVerifySignature = authVerifySignature;
const handleUser = (f) => async (req, rep) => {
    try {
        const { address, accountBalance } = req.body;
        if (!address || !accountBalance)
            return (0, http_code_1._400)(rep, 'all fields are required.');
        const jti = (0, crypto_1.randomUUID)();
        let user = await user_models_1.default.findOne({ address });
        if (!user)
            user = await user_models_1.default.create({ address, accountBalance });
        const sub = user._id;
        await refresh_token_model_1.default.create({
            expiresAt: expiresIn7Days(),
            jti,
            user: sub
        });
        const refreshToken = f.jwt.sign({
            jti,
            sub
        }, { expiresIn: '7d' });
        setCookie(rep, refreshToken);
        const token = f.jwt.sign({ sub }, { expiresIn: tokenTime });
        return rep.code(201).send({ ok: true, id: sub, token });
    }
    catch (e) {
        console.error(e);
        (0, http_code_1._500)(rep);
    }
};
exports.handleUser = handleUser;
// implement refresh token controller
