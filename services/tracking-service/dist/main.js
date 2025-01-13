"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const data_source_1 = require("./data-source");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors();
        await data_source_1.AppDataSource.initialize();
        logger.log('Data Source has been initialized successfully');
        const port = process.env.PORT || 3003;
        await app.listen(port);
        logger.log(`Application is running on port ${port}`);
    }
    catch (error) {
        logger.error(`Error starting application: ${error.message}`);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map