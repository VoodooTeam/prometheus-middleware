/// <reference types="node" />
export = APM;
declare class APM {
    constructor(config?: {});
    config: {};
    client: typeof client;
    server: http.Server;
    init(): void;
    destroy(): void;
}
import client = require("prom-client");
import http = require("http");
