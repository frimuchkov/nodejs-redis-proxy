import * as config from 'config';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import logger from "../libs/logger";
import * as http from "http";

class HttpServer {
  async init(): Promise<Server> {
    const app = express();
    app.use('/:key', (req: Request, res: Response, next: NextFunction) => {
      if (req.params.key != null) {
        res.send({ key: req.params.key })
      }
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      res.sendStatus(404);
    });


    const appPort = Number(config.get<string>('appPort'));
    return new Promise((resolve, reject) => {
      try {
        let server: http.Server;
        server = app.listen(appPort, () => {
          logger.info(`Server created on port ${appPort}`);
          resolve(server);
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
}

export default HttpServer;
