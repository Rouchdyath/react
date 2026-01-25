import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Ticket System API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }
}
