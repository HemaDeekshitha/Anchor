import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { CommunityCacheService } from './community-cache.service';

const RATE_LIMIT_KEY = 'community-rate-limit';
type RateLimitOptions = { limit: number; windowSeconds: number };

export const DistributedRateLimit = (limit: number, windowSeconds: number) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowSeconds });
// T: O(1) and S: O(1)

@Injectable()
export class DistributedRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: CommunityCacheService,
  ) {}
  // T: O(1) and S: O(1)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userId = request.user?.userId ?? request.ip ?? 'anonymous';
    const route = `${request.method}:${context.getClass().name}:${context.getHandler().name}`;
    const result = await this.cache.consumeLimit(
      `rate:community:${route}:${userId}`,
      options.limit,
      options.windowSeconds,
    );
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    if (!result.allowed) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
  // T: O(1) and S: O(1)
}
