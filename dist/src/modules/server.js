"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const express = require("express");
const logger_1 = require("../libs/logger");
class HttpServer {
    async init() {
        const app = express();
        app.use('/:key', (req, res, next) => {
            if (req.params.key != null) {
                res.send({ key: req.params.key });
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