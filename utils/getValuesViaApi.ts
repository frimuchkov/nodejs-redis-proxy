import * as config from 'config';
import * as rp from "request-promise-native";
import logger from "../src/libs/logger";

const url = `http://localhost:${Number(config.get<string>('appPort'))}`;

const getValuesViaApi = async () => {
  const keys = process.argv.slice(2);
  if (keys.length === 0) {
    console.log('You should pass keys in args');
    return;
  }
  const res = await Promise.all(keys.map(async (key) => {
    try {
      const value = await rp.get(`${url}/${key}`);
      return {
        key,
        value,
      }
    } catch (e) {
      return {
        key,
        e: e.message,
      }
    }
  }));

  console.log(res);
};

getValuesViaApi()
  .catch((e) => {
  logger.error('Oops, somethings wend wrong', e);
    process.exit(1)
});

