"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const tracking_entity_1 = require("./entities/tracking.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307"),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "levelup_db",
    synchronize: true,
    logging: true,
    entities: [tracking_entity_1.TrackingRecord],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map