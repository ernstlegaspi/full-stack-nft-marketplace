"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUser = exports.authNonce = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const http_code_1 = require("../utils/http_code");
const authNonce = (f) => async (req, rep) => {
    try {
    }
    catch (e) {
        (0, http_code_1._500)(rep);
    }
};
exports.authNonce = authNonce;
const handleUser = (f) => async (req, rep) => {
    try {
        const { address, accountBalance } = req.body;
        if (!address || !accountBalance)
            return (0, http_code_1._400)(rep);
        await user_models_1.default.create({ address, accountBalance });
    }
    catch (e) {
        (0, http_code_1._500)(rep);
    }
};
exports.handleUser = handleUser;
