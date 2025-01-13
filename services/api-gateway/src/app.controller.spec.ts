/**
 * app.controller.spec.ts
 * Test suite for the AppController
 * Demonstrates basic unit testing setup for NestJS controllers
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  // Set up testing module before each test
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    // Get instance of controller for testing
    appController = app.get<AppController>(AppController);
  });

  // Test the root endpoint
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});