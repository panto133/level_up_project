/**
 * Basic application service providing hello world functionality
 * This is primarily used for testing and health checks
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}