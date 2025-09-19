"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const decode = (f, req) => f.jwt.decode(req.cookies.token);
exports.decode = decode;
