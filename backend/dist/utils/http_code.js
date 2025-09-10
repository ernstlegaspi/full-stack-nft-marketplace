"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._500 = exports._400 = void 0;
const _400 = (rep) => rep.code(400).send({ message: 'Bad Request.' });
exports._400 = _400;
const _500 = (rep) => rep.code(500).send({ message: 'Internal Server Error.' });
exports._500 = _500;
