import * as rp from 'request-promise-native';
import * as config from 'config';
import { expect } from 'chai';
import HttpServer from '../src/modules/server';
import redisInstance from '../src/modules/redisClient';


const url = `http://localhost:${Number(config.get<string>('appPort'))}`;

describe('Api tests', () => {
    const server = new HttpServer();
    before(('Start server'), async () => {
        await server.init();
        await redisInstance.connect();
    });


    before(('Fill redis'), async () => {
        await Promise
          .all((new Array(10).fill(1)
          .map(((value, index) => {
                return new Promise(resolve =>
                  (redisInstance as any)
                    .connection
                    .set(`key_${index}`, `value_${index}`, () => resolve()));
            })
          )))
    });

    describe ('Doubly linked list', () => {
        it ('Should return value from redis', async () => {
            const result = await rp.get(`${url}/key_1`);
            expect(result).to.be.eq('value_1');
        });

        it ('Should return value from cache', async () => {
            (redisInstance as any).cache.list.add('key_1', {
                expiredTime: Date.now() + 10000,
                value: 'value_from_cache',
            });
            const result = await rp.get(`${url}/key_1`);
            expect(result).to.be.eq('value_from_cache');
        });

        it ('Should return 404 when key not found', async () => {
            const result = await rp.get(
              `${url}/nonexistent_key`,
              {
                  resolveWithFullResponse: true,
                  simple: false,
              }

            );
            expect(result.statusCode).to.be.eq(404);
        });

        it ('Should return 404 when there is no key in path', async () => {
            const result = await rp.get(
              url,
              {
                  resolveWithFullResponse: true,
                  simple: false,
              }

            );
            expect(result.statusCode).to.be.eq(404);
        });
    });

    after(('Stop server'), async () => {
        await server.stop();
    });

    after(('Flush redis'), async () => {
        await new Promise(resolve => (redisInstance as any)
          .connection.flushall(() => resolve()));

        await new Promise(resolve => (redisInstance as any).connection.quit(() => resolve()));
        (redisInstance as any).connection = undefined;
    });
});
