// app.controller.spec.ts - Unit tests for the AppController
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Test suite for AppController
 * Demonstrates how to write unit tests for NestJS controllers
 */
describe('AppController', () => {
  let appController: AppController;

  /**
   * Before each test, create a new instance of AppController
   * This ensures each test starts with a fresh controller instance
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * Test suite for the root endpoint
   * Verifies the basic functionality of the controller
   */
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});