/// <reference types="node" />
import { Server } from 'http';
declare class HttpServer {
    init(): Promise<Server>;
}
export default HttpServer;
