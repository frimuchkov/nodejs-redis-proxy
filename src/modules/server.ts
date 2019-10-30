import * as config from 'config';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import logger from '../libs/logger';
import * as http from 'http';
import redisInstance from './redisClient';
import { RequestQueueManager } from './requestQueueManager';
import { ProxyErrors } from '../libs/proxyErrors';

class HttpServer {
  private server: http.Server | undefined;
  private requestQueueManager: RequestQueueManager;

  constructor() {
    this.requestQueueManager = new RequestQueueManager(
        Number(config.get<string>('maxParallelRequests')),
        Number(config.get<string>('maxConnections'))
    );
  }

  async init(): Promise<Server> {
    const app = express();
    app.use('/:key', async (req: Request, res: Response, next: NextFunction) => {
      try {
        this.requestQueueManager.executeRequest(async () => {
          try {
            if (req.params.key != null) {
              const value = await redisInstance.get(req.params.key);
              if (value == null) {
                return res.sendStatus(404);
              }
              res.send(value);
            } else {
              next();
            }
          } catch (e) {
            logger.error(`Error while process request with key ${req.params.key}`, e);
            return res.sendStatus(500);
          }
        });
      } catch (e) {
        if (e.message === ProxyErrors.MAX_CONNECTIONS_EXCEEDED) {
          return res.sendStatus(503);
        } else {
          logger.error(`Error while process request with key ${req.params.key}`, e);
          return res.sendStatus(500);
        }
      }
    });

    app.use((req: Request, res: Response) => {
      res.sendStatus(404);
    });


    const appPort = Number(config.get<string>('appPort'));
    return new Promise((resolve, reject) => {
      try {
        this.server = app.listen(appPort, () => {
          logger.info(`Server created on port ${appPort}`);
          resolve(this.server);
        });
      } catch (err) {
        logger.error(`Server can't be created on port ${appPort}`);
        reject(err);
      }
      app.on('error', (err) => {
        logger.error(`Server can't be created on port ${appPort}`);
        reject(err);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject('No server init');
        return;
      }
      this.server.close(() => resolve());
    });
  }
}

export default HttpServer;
