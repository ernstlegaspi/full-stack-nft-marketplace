"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fastify_1 = __importDefault(require("fastify"));
const mongoose_1 = __importDefault(require("mongoose"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const jwt_1 = __importDefault(require("./plugins/jwt"));
const redis_1 = __importDefault(require("./plugins/redis"));
const nft_route_1 = __importDefault(require("./routes/nft.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
(async () => {
    dotenv_1.default.config();
    const app = (0, fastify_1.default)({
        ajv: {
            customOptions: {
                coerceTypes: false,
                allErrors: true
            }
        },
        logger: true
    });
    app.register(jwt_1.default);
    app.register(redis_1.default);
    app.register(multipart_1.default);
    app.register(cors_1.default, {
        credentials: true,
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });
    app.register(cookie_1.default, {
        secret: process.env.COOKIE_SECRET,
        hook: 'onRequest'
    });
    app.addSchema({
        $id: 'ErrorResponse',
        type: 'object',
        additionalProperties: false,
        required: ['ok', 'message'],
        properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' }
        }
    });
    app.setErrorHandler((err, req, rep) => {
        const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
        rep.code(status).send({ ok: false, message: err.message || 'Internal Server Error.' });
    });
    app.register(nft_route_1.default, { prefix: '/api/nft/' });
    app.register(user_route_1.default, { prefix: '/api/user/' });
    try {
        const PORT = process.env.PORT || 2217;
        await mongoose_1.default.connect(process.env.DATABASE_URI);
        await app.listen({ port: Number(PORT) });
        console.log(`Server is running in port: ${PORT}`);
    }
    catch (e) {
        app.log.error(e);
    }
})();
