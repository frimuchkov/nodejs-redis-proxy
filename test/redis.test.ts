import {assert, expect} from 'chai';
import redisInstance from '../src/modules/redisClient';
import logger from "../src/libs/logger";


describe('Api tests', () => {
  afterEach(async () => {
    if ((redisInstance as any).connection == null) {
      return;
    }
    await new Promise(resolve => (redisInstance as any).connection.quit(() => resolve()));
    (redisInstance as any).connection = undefined;
  });

  it ('Should connect to redis', async () => {
    await redisInstance.connect();
  });

  describe ('Catch redis error', async () => {
    const oldData = redisInstance.connectData;
    afterEach('Save options', () => {
      redisInstance.connectData = oldData;
    });
    it('Should catch connection error', async () => {
      redisInstance.connectData = {
        database: '0',
        host: '12345',
        port: 12345,
      };
      let error: Error | undefined;
      try {
        await redisInstance.connect();
      } catch (e) {
        error = e;
      }

      expect(error).is.not.an('undefined');
    });

    it('Should catch get error', async () => {
      const errMessage = 'Test error';
      await redisInstance.connect();
      (redisInstance as any).connection.get = (key: string, cb: (err: Error | null, reply: string) => void) => {
        cb(new Error(errMessage), '');
      };

      let error: Error | undefined;
      try {
        await redisInstance.get('key');
      } catch (e) {
        error = e;
      }

      if (error == null) {
        assert(false, 'Should throw error');
        return;
      }

      expect(error.message).to.be.eq(errMessage);
    })
  });

  describe ('Close connection', async () => {
    let call: (...args: any[]) => any = () => {};
    let loggerInfo: (...args: any[]) => any;
    before('Mock logger', () => {
      loggerInfo = logger.info;
      logger.info = (...args: any[]) => call(...args);
    });

    before('Connect to redis', async () => {
      await redisInstance.connect();
    });

    it ('Should emit event after disconnect from redis', async () => {
      let message: string = '';
      call = (loggerMessage: string) => message = loggerMessage;

      await new Promise(resolve => (redisInstance as any).connection.quit(() => resolve()));

      // Emitting event will catch on next event loop interation
      await new Promise(resolve => setTimeout((resolve), 50));
      expect(message).to.contains('Disconnect from Redis');
    });

    after('Restore logger', () => {
      logger.error = loggerInfo;
    })
  });
});
