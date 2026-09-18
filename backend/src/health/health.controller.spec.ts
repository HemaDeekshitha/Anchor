import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityCacheService } from '../community/infrastructure/community-cache.service';
import { HealthController } from './health.controller';

describe('HealthController readiness', () => {
  const dataSource = { query: jest.fn() } as unknown as DataSource;
  const cache = { readiness: jest.fn() } as unknown as CommunityCacheService;
  const controller = new HealthController(dataSource, cache);

  beforeEach(() => jest.clearAllMocks());

  it('reports the database, migrated schema, and Redis as ready', async () => {
    (dataSource.query as jest.Mock).mockResolvedValue([
      {
        coreSchemaReady: true,
        mediaFilenameReady: true,
        commentVotesReady: true,
      },
    ]);
    (cache.readiness as jest.Mock).mockResolvedValue('reachable');

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ready',
      database: 'reachable',
      redis: 'reachable',
      communitySchema: 'ready',
    });
  });

  it.each(['database', 'schema'])(
    'fails closed for %s errors',
    async (failure) => {
      (dataSource.query as jest.Mock).mockResolvedValue([
        {
          coreSchemaReady: failure !== 'schema',
          mediaFilenameReady: true,
          commentVotesReady: true,
        },
      ]);
      (cache.readiness as jest.Mock).mockResolvedValue('reachable');
      if (failure === 'database') {
        (dataSource.query as jest.Mock).mockRejectedValue(new Error('offline'));
      }

      await expect(controller.readiness()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    },
  );

  it('stays ready when Redis is disabled and reports a warning', async () => {
    (dataSource.query as jest.Mock).mockResolvedValue([
      {
        coreSchemaReady: true,
        mediaFilenameReady: true,
        commentVotesReady: true,
      },
    ]);
    (cache.readiness as jest.Mock).mockResolvedValue('disabled');

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ready',
      redis: 'disabled',
      warning: expect.stringContaining('REDIS_URL'),
    });
  });

  it('stays ready when optional schema pieces are missing', async () => {
    (dataSource.query as jest.Mock).mockResolvedValue([
      {
        coreSchemaReady: true,
        mediaFilenameReady: false,
        commentVotesReady: false,
      },
    ]);
    (cache.readiness as jest.Mock).mockResolvedValue('reachable');

    await expect(controller.readiness()).resolves.toMatchObject({
      status: 'ready',
      communitySchema: 'ready',
      warning: expect.stringContaining('originalFilename'),
    });
  });
});
