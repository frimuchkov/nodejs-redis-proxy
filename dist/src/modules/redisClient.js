"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const config = require("config");
const logger_1 = require("../libs/logger");
function connectToRedisBeforeCall(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function () {
        await this.connect();
        return await originalMethod.apply(this, arguments);
    };
    return descriptor;
}
class Redis {
    constructor() {
        const opts = config.get('connections.redis');
        this.connectData = {
            database: opts.database,
            host: opts.host,
            port: Number(opts.port),
        };
    }
    async connect() {
        if (this.connection) {
            return this.connection;
        }
        const connection = redis.createClient(this.connectData);
        this.connection = connection;
        return new Promise((resolve, reject) => {
            connection.on('error', (err) => {
                logger_1.default.error(`Error in REDIS.${name}:`, err);
                return reject(err);
            });
            connection.on('connect', () => {
                logger_1.default.info(`Connect to REDIS.${name}: http://${this.connectData.host}:${this.connectData.port}, database: ${this.connectData.database}`);
                resolve(connection);
            });
            connection.on('disconnect', () => {
                logger_1.default.info(`Disconnect from REDIS.${name}: http://${this.connectData.host}:${this.connectData.port}, database: ${this.connectData.database}`);
            });
        });
    }
    async get(key) {
        return new Promise((resolve, reject) => this.connection.get(key, (err, reply) => {
            if (err != null) {
                return reject(err);
            }
            resolve(reply);
        }));
    }
}
__decorate([
    connectToRedisBeforeCall
], Redis.prototype, "get", null);
const redisInstance = new Redis();
exports.default = redisInstance;
//# sourceMappingURL=redisClient.js.map