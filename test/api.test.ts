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
            (server as any).cache.list.add('key_1', {
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


        describe ('Exceed connections limit', () => {
            before('Set max connections to 0' , () => {
                (server as any).requestQueueManager.maxRequests = 0;
            });

            it ('Should return 503 when maximum connections exceeded', async () => {
                const result = await rp.get(
                  `${url}/key`,
                  {
                      resolveWithFullResponse: true,
                      simple: false,
                  }

                );
                expect(result.statusCode).to.be.eq(503);
            });

            after('Set max connections to default' , () => {
                (server as any).requestQueueManager.maxRequests = Number(config.get<string>('maxConnections'));
            });

        });

        describe ('Return 500 if something went wrong in request limiter', () => {
            const executeRequest = (server as any).requestQueueManager.executeRequest.bind((server as any).requestQueueManager);
            before('Mock request limiter', () => {
                (server as any).requestQueueManager.executeRequest = () => {
                    throw new Error('Request limiter error');
                };
            });

            it ('Should return 500', async () => {
                const result = await rp.get(
                  `${url}/key`,
                  {
                      resolveWithFullResponse: true,
                      simple: false,
                  }

                );
                expect(result.statusCode).to.be.eq(500);
            });

            after('Restore request limiter' , () => {
                (server as any).requestQueueManager.executeRequest = executeRequest;
            });
        });

        describe ('Return 500 if something went wrong in async part', () => {
            const cacheGet = (server as any).cache.get.bind((server as any).cache);
            before('Mock cache', () => {
                (server as any).cache.get = () => {
                    throw new Error('Cache error');
                };
            });

            it ('Should return 500', async () => {
                const result = await rp.get(
                  `${url}/key`,
                  {
                      resolveWithFullResponse: true,
                      simple: false,
                  }

                );
                expect(result.statusCode).to.be.eq(500);
            });

            after('Restore request limiter' , () => {
                (server as any).cache.get.executeRequest = cacheGet;
            });
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
