import * as redis from 'redis';
import * as config from 'config';
import { RedisClient } from 'redis';
import logger from '../libs/logger';

interface RedisConnectionOptions {
    database: string;
    host: string;
    port: number;
}


function connectToRedisBeforeCall(
    target: Redis,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>,
): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value;
    descriptor.value = async function (
        this: Redis,
    ) {
        await this.connect();
        return await originalMethod.apply(this, arguments);
    };
    return descriptor;
}


class Redis {
    connection: RedisClient;
    connectData: RedisConnectionOptions;
    constructor() {
        const opts = config.get<RedisConnectionOptions>('connections.redis');
        this.connectData = {
            database: opts.database,
            host: opts.host,
            port: Number(opts.port),
        };
    }

    async connect(): Promise<RedisClient> {
        if (this.connection) {
            return this.connection;
        }
        const connection = redis.createClient(this.connectData);
        this.connection = connection;
        return new Promise((resolve, reject) => {
            connection.on('error', (err) => {
                logger.error(`Error in REDIS.${name}:`, err);
                return reject(err);
            });

            connection.on('connect', () => {
                logger.info(`Connect to REDIS.${name}: http://${this.connectData.host}:${this.connectData.port
                    }, database: ${this.connectData.database}`);
                resolve(connection);
            });
            connection.on('disconnect', () => {
                logger.info(`Disconnect from REDIS.${name}: http://${this.connectData.host}:${this.connectData.port
                }, database: ${this.connectData.database}`);
            });
        });
    }

    @connectToRedisBeforeCall
    async get(key: string): Promise<string> {
        return new Promise((resolve, reject) => this.connection.get(key, (err, reply) => {
            if (err != null) {
                return reject(err);
            }
            resolve(reply)
        }));
    }
}

const redisInstance = new Redis();

export default redisInstance;
