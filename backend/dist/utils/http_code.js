"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._500 = exports._401 = exports._400 = void 0;
const _400 = (rep, message) => rep.code(400).send({ ok: false, message });
exports._400 = _400;
const _401 = (rep, message) => rep.code(400).send({ ok: false, message });
exports._401 = _401;
const _500 = (rep) => rep.code(500).send({ ok: false, message: 'Internal Server Error.' });
exports._500 = _500;
