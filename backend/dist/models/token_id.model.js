"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TokenIDSchema = new mongoose_1.Schema({
    contractAddress: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    }
});
exports.default = (0, mongoose_1.model)('TokenID', TokenIDSchema);
