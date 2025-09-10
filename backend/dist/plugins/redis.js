"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const ioredis_1 = __importDefault(require("ioredis"));
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    const redis = new ioredis_1.default(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        connectTimeout: 10_000,
        lazyConnect: false,
        retryStrategy: times => Math.min(times * 200, 2000)
    });
    app.decorate('redis', redis);
    app.addHook('onClose', async () => {
        await redis.quit();
    });
});
