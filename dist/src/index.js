"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./libs/logger");
const server_1 = require("./modules/server");
const start = async () => {
    const server = new server_1.default();
    await server.init();
};
start().catch((e) => logger_1.default.error('Error while init system', e));
//# sourceMappingURL=index.js.map