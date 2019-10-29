import * as redis from 'redis';
import {RedisClient} from 'redis';
import * as config from 'config';
import logger from '../libs/logger';
import {LruCache} from "./lruCache";

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
    cache: LruCache<string>;
    constructor() {
        const opts = config.get<Omit<RedisConnectionOptions, 'port'> & { port: string }>('connections.redis');
        this.connectData = {
            database: opts.database,
            host: opts.host,
            port: Number(opts.port),
        };
        this.cache = new LruCache(
          Number(config.get<string>('cache.capacity')),
          Number(config.get<string>('cache.ttl')),
        );
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
        const resultFromCache = this.cache.get(key);
        if (resultFromCache !== null) {
          return resultFromCache;
        }
        return new Promise((resolve, reject) => this.connection.get(key, (err, reply) => {
            if (err != null) {
                return reject(err);
            }
            this.cache.set(key, reply);
            resolve(reply)
        }));
    }
}

const redisInstance = new Redis();

export default redisInstance;
