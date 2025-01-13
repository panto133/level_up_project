"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tracking_controller_1 = require("./controllers/tracking.controller");
const tracking_service_1 = require("./services/tracking.service");
const tracking_entity_1 = require("./entities/tracking.entity");
const database_config_1 = require("./config/database.config");
const configuration_module_1 = require("./config/configuration.module");
const core_1 = require("@nestjs/core");
const http_exception_filter_1 = require("./filters/http-exception.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            configuration_module_1.ConfigurationModule,
            typeorm_1.TypeOrmModule.forRoot(database_config_1.databaseConfig),
            typeorm_1.TypeOrmModule.forFeature([tracking_entity_1.TrackingRecord])
        ],
        controllers: [tracking_controller_1.TrackingController],
        providers: [
            tracking_service_1.TrackingService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map