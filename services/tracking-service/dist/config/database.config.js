"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const tracking_entity_1 = require("../entities/tracking.entity");
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'levelup_db',
    entities: [tracking_entity_1.TrackingRecord],
    synchronize: true,
    charset: 'utf8mb4',
    timezone: '+01:00',
};
//# sourceMappingURL=database.config.js.map