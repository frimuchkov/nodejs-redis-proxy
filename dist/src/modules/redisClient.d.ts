import { RedisClient } from 'redis';
interface RedisConnectionOptions {
    database: string;
    host: string;
    port: number;
}
declare class Redis {
    connection: RedisClient;
    connectData: RedisConnectionOptions;
    constructor();
    connect(): Promise<RedisClient>;
    get(key: string): Promise<string>;
}
declare const redisInstance: Redis;
export default redisInstance;
