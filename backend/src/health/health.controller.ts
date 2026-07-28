import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}
  // T: O(1) and S: O(1)

  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  // T: O(1) and S: O(1)

  @Get('ready')
  async readiness() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ready',
        database: 'reachable',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException('Database is unavailable');
    }
  }
  // T: O(1) database round trip and S: O(1)
}
