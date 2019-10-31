import * as config from 'config';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import logger from '../libs/logger';
import * as http from 'http';
import redisInstance from './redisClient';
import { RequestQueueManager } from './requestQueueManager';
import { ProxyErrors } from '../libs/proxyErrors';
import {LruCache} from "./lruCache";

class HttpServer {
  private server: http.Server | undefined;
  private requestQueueManager: RequestQueueManager;
  private cache: LruCache<string>;
  private readonly appPort: number;

  constructor() {
    this.requestQueueManager = new RequestQueueManager(
        Number(config.get<string>('maxParallelRequests')),
        Number(config.get<string>('maxConnections'))
    );

    this.cache = new LruCache(
      Number(config.get<string>('cache.capacity')),
      Number(config.get<string>('cache.ttl')),
    );

    this.appPort = Number(config.get<string>('appPort'));
  }

  async init(): Promise<Server> {
    if (this.server != null) {
      return this.server;
    }
    const app = express();
    app.use('/:key', async (req: Request, res: Response, next: NextFunction) => {
      try {
        this.requestQueueManager.executeRequest(async () => {
          try {
            const key = req.params.key;
            let value = this.cache.get(key);
            if (value == null) {
              value = await redisInstance.get(key);
              if (value != null) {
                this.cache.set(key, value);
              }
            }

            if (value == null) {
              return res.sendStatus(404);
            }
            res.send(value);
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


    return new Promise((resolve, reject) => {
      try {
        this.server = app.listen(this.appPort, () => {
          logger.info(`Server created on port ${this.appPort}`);
          resolve(this.server);
        }).on('error', (err) => {
          logger.error(`Server can't be created on port ${this.appPort}`, err);
          delete this.server;
          reject(err);
        });
      } catch (err) {
        logger.error(`Error while server init, server can't be created on port ${this.appPort}`, err);
        delete this.server;
        reject(err);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('No server init'));
        return;
      }
      this.server.close(() => {
        resolve();
      });
      delete this.server;
    });
  }
}

export default HttpServer;
