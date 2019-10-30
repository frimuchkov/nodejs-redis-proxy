import 'reflect-metadata';
import logger from './libs/logger';
import HttpServer from './modules/server';

const start = async () => {
  const server = new HttpServer();
  await server.init();
};

start().catch((e) => logger.error('Error while init system', e));
