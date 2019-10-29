"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const express = require("express");
const logger_1 = require("../libs/logger");
const redisClient_1 = require("./redisClient");
class HttpServer {
    async init() {
        const app = express();
        app.use('/:key', async (req, res, next) => {
            if (req.params.key != null) {
                const value = await redisClient_1.default.get(req.params.key);
                if (value == null) {
                    return res.sendStatus(404);
                }
                res.send(value);
            }
            else {
                next();
            }
        });
        app.use((req, res, next) => {
            res.sendStatus(404);
        });
        const appPort = Number(config.get('appPort'));
        return new Promise((resolve, reject) => {
            try {
                let server;
                server = app.listen(appPort, () => {
                    logger_1.default.info(`Server created on port ${appPort}`);
                    resolve(server);
                });
            }
            catch (err) {
                logger_1.default.error(`Server can't be created on port ${appPort}`);
                reject(err);
            }
            app.on('error', (err) => {
                logger_1.default.error(`Server can't be created on port ${appPort}`);
                reject(err);
            });
        });
    }
}
exports.default = HttpServer;
//# sourceMappingURL=server.js.map