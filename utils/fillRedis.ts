import redisInstance from "../src/modules/redisClient";
import logger from "../src/libs/logger";

const fillRedis = async () => {
  await redisInstance.connect();
  await new Promise(resolve => (redisInstance as any)
    .connection.flushall(() => resolve()));
  await Promise
    .all((new Array(50).fill(1)
      .map(((value, index) => {
          return new Promise(resolve =>
            (redisInstance as any)
              .connection
              .set(`key_${index}`, `value_${index}`, () => resolve()));
        })
      )));
};

fillRedis()
  .then(() =>  process.exit(0))
  .catch((e) => {
  logger.error('Oops, somethings wend wrong', e);
  (redisInstance as any).connection.quit(() => process.exit(1));
});

