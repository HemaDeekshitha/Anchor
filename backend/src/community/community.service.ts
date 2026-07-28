import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { OnboardingResponse } from '../onboarding/onboarding.entity';
import { User } from '../users/user.entity';
import {
  AcceptInviteDto,
  CreateCommentDto,
  CreateCommunityDto,
  CreateInviteDto,
  CreatePostDto,
  ListQueryDto,
  ResolveFriendRequestDto,
  SendFriendRequestDto,
  UpdatePostDto,
  VotePollDto,
  VotePostDto,
} from './dto/community.dto';
import {
  Community,
  CommunityInvite,
  CommunityMember,
  CommunityOutboxEvent,
  CommunityPost,
  Friendship,
  Poll,
  PollOption,
  PollVote,
  PostComment,
  PostMedia,
  PostVote,
} from './entities/community.entities';
import { CommunityCacheService } from './infrastructure/community-cache.service';
import { CommunityMediaService } from './infrastructure/community-media.service';
import { CommunityQueueService } from './infrastructure/community-queue.service';

type Cursor = { createdAt: string; id: string };
const POST_EDIT_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class CommunityService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cache: CommunityCacheService,
    private readonly mediaService: CommunityMediaService,
    private readonly queue: CommunityQueueService,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private readonly memberRepository: Repository<CommunityMember>,
    @InjectRepository(CommunityInvite)
    private readonly inviteRepository: Repository<CommunityInvite>,
    @InjectRepository(CommunityPost)
    private readonly postRepository: Repository<CommunityPost>,
    @InjectRepository(PostMedia)
    private readonly postMediaRepository: Repository<PostMedia>,
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly pollOptionRepository: Repository<PollOption>,
    @InjectRepository(PollVote)
    private readonly pollVoteRepository: Repository<PollVote>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OnboardingResponse)
    private readonly onboardingRepository: Repository<OnboardingResponse>,
  ) {}
  // T: O(1) and S: O(1)

  private slugify(value: string): string {
    const base = value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);
    return `${base || 'community'}-${crypto.randomBytes(3).toString('hex')}`;
  }
  // T: O(n) and S: O(n), where n is the input length

  private encodeCursor(value: { createdAt: Date; id: string }): string {
    const payload = Buffer.from(
      JSON.stringify({
        createdAt: value.createdAt.toISOString(),
        id: value.id,
      }),
    ).toString('base64url');
    const secret =
      process.env.CURSOR_SIGNING_SECRET ?? process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new BadRequestException('Pagination is unavailable');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }
  // T: O(c) and S: O(c), where c is the cursor payload length

  private decodeCursor(value?: string): Cursor | null {
    if (!value) return null;
    try {
      const [payload, signature] = value.split('.');
      const secret =
        process.env.CURSOR_SIGNING_SECRET ?? process.env.JWT_ACCESS_SECRET;
      if (!payload || !signature || !secret) throw new Error('invalid');
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest();
      const provided = Buffer.from(signature, 'base64url');
      if (
        provided.length !== expected.length ||
        !crypto.timingSafeEqual(provided, expected)
      ) {
        throw new Error('invalid');
      }
      const cursor = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as Cursor;
      if (
        !cursor.createdAt ||
        Number.isNaN(Date.parse(cursor.createdAt)) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          cursor.id,
        )
      ) {
        throw new Error('invalid');
      }
      return cursor;
    } catch {
      throw new BadRequestException('Invalid pagination cursor');
    }
  }
  // T: O(c) and S: O(c), where c is the cursor length

  private hashInviteSecret(secret: string): string {
    const key = process.env.INVITE_HASH_SECRET ?? process.env.JWT_ACCESS_SECRET;
    if (!key) throw new BadRequestException('Invite service is unavailable');
    return crypto.createHmac('sha256', key).update(secret).digest('hex');
  }
  // T: O(s) and S: O(1), where s is the secret length

  private async requireMembership(
    userId: string,
    communityId: string,
    roles?: CommunityMember['role'][],
  ): Promise<CommunityMember> {
    const member = await this.memberRepository.findOneBy({
      userId,
      communityId,
      status: 'active',
    });
    if (!member || (roles && !roles.includes(member.role))) {
      throw new ForbiddenException('Community access denied');
    }
    return member;
  }
  // T: O(log M) and S: O(1), where M is the number of memberships

  private async requirePostAccess(
    userId: string,
    post: CommunityPost,
  ): Promise<void> {
    if (post.communityId) {
      await this.requireMembership(userId, post.communityId);
    }
  }
  // T: O(log M) and S: O(1), where M is the number of memberships

  private async invalidatePostCaches(
    communityId: string | null,
  ): Promise<void> {
    const invalidations = [
      this.cache.deleteByPrefix('community:global-posts:'),
    ];
    if (communityId) {
      invalidations.push(
        this.cache.deleteByPrefix(`community:posts:${communityId}:`),
        this.cache.deleteByPrefix('community:feed:'),
      );
    }
    await Promise.all(invalidations);
  }
  // T: O(k) and S: O(k), where k is the bounded number of cache namespaces

  private async requireFriendship(
    userId: string,
    friendId: string,
  ): Promise<void> {
    const [userLowId, userHighId] = [userId, friendId].sort();
    const accepted = await this.friendshipRepository.exist({
      where: { userLowId, userHighId, status: 'accepted' },
    });
    if (!accepted) {
      throw new ForbiddenException(
        'Direct community invitations are limited to friends',
      );
    }
  }
  // T: O(log F) and S: O(1), where F is the number of friendships

  async createCommunity(
    userId: string,
    dto: CreateCommunityDto,
  ): Promise<Community> {
    if (dto.visibility === 'private' && dto.joinPolicy === 'open') {
      throw new BadRequestException('Private communities cannot be open');
    }
    const community = await this.dataSource.transaction(async (manager) => {
      const created = manager.create(Community, {
        ownerId: userId,
        name: dto.name.trim(),
        slug: this.slugify(dto.name),
        description: dto.description.trim(),
        visibility: dto.visibility,
        joinPolicy: dto.joinPolicy,
      });
      const saved = await manager.save(created);
      await manager.save(
        manager.create(CommunityMember, {
          communityId: saved.id,
          userId,
          role: 'owner',
          status: 'active',
        }),
      );
      const friendIds = [...new Set(dto.friendIds ?? [])].filter(
        (id) => id !== userId,
      );
      if (friendIds.length > 0) {
        const friendships = await manager
          .getRepository(Friendship)
          .createQueryBuilder('f')
          .where('f.status = :status', { status: 'accepted' })
          .andWhere(
            new Brackets((query) => {
              query
                .where(
                  'f."userLowId" = :userId AND f."userHighId" IN (:...ids)',
                )
                .orWhere(
                  'f."userHighId" = :userId AND f."userLowId" IN (:...ids)',
                );
            }),
          )
          .setParameters({ userId, ids: friendIds })
          .getMany();
        const acceptedIds = friendships.map((friendship) =>
          friendship.userLowId === userId
            ? friendship.userHighId
            : friendship.userLowId,
        );
        if (acceptedIds.length > 0) {
          await manager.save(
            acceptedIds.map((inviteeUserId) =>
              manager.create(CommunityInvite, {
                communityId: saved.id,
                createdBy: userId,
                inviteeUserId,
                kind: 'direct',
                maxUses: 1,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000),
              }),
            ),
          );
        }
      }
      return saved;
    });
    await Promise.all([
      this.cache.deleteByPrefix('community:list:discover:'),
      this.cache.deleteByPrefix(`community:list:joined:${userId}:`),
    ]);
    return community;
  }
  // T: O(f log F) and S: O(f), where f is invited friends and F is friendships

  async listCommunities(
    userId: string,
    scope: 'joined' | 'discover',
    query: ListQueryDto,
  ): Promise<{ items: Community[]; nextCursor: string | null }> {
    const cursor = this.decodeCursor(query.cursor);
    const cacheKey = `community:list:${scope}:${userId}:${query.search ?? ''}:${query.cursor ?? ''}:${query.limit}`;
    const cached = await this.cache.getJson<{
      items: Community[];
      nextCursor: string | null;
    }>(cacheKey);
    if (cached) return cached;

    const builder = this.communityRepository
      .createQueryBuilder('community')
      .where('community.status = :status', { status: 'active' })
      .orderBy('community.createdAt', 'DESC')
      .addOrderBy('community.id', 'DESC')
      .take(query.limit + 1);
    if (scope === 'joined') {
      builder
        .innerJoin(
          CommunityMember,
          'membership',
          'membership."communityId" = community.id',
        )
        .andWhere('membership."userId" = :userId', { userId })
        .andWhere('membership.status = :memberStatus', {
          memberStatus: 'active',
        });
    } else {
      builder.andWhere('community.visibility = :visibility', {
        visibility: 'public',
      });
    }
    if (query.search?.trim()) {
      builder.andWhere(
        "LOWER(community.name || ' ' || community.description) LIKE :search",
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }
    if (cursor) {
      builder.andWhere(
        '(community."createdAt", community.id) < (:createdAt, :id)',
        cursor,
      );
    }
    const rows = await builder.getMany();
    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const result = {
      items,
      nextCursor:
        hasMore && items.length
          ? this.encodeCursor(items[items.length - 1])
          : null,
    };
    await this.cache.setJson(cacheKey, result, 45);
    return result;
  }
  // T: O(l log C) and S: O(l), where l is page size and C is communities

  async getCommunity(userId: string, communityId: string): Promise<Community> {
    const community = await this.communityRepository.findOneBy({
      id: communityId,
      status: 'active',
    });
    if (!community) throw new NotFoundException('Community not found');
    if (community.visibility === 'private') {
      await this.requireMembership(userId, communityId);
    }
    return community;
  }
  // T: O(log C + log M) and S: O(1)

  async joinCommunity(
    userId: string,
    communityId: string,
  ): Promise<CommunityMember> {
    const membership = await this.dataSource.transaction(async (manager) => {
      const community = await manager.findOne(Community, {
        where: { id: communityId, status: 'active' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!community) throw new NotFoundException('Community not found');
      if (community.visibility === 'private') {
        throw new ForbiddenException('An invitation is required');
      }
      if (community.joinPolicy === 'invite_only') {
        throw new ForbiddenException('An invitation is required');
      }
      const repository = manager.getRepository(CommunityMember);
      let membership = await repository.findOneBy({ communityId, userId });
      const nextStatus = community.joinPolicy === 'open' ? 'active' : 'pending';
      const wasActive = membership?.status === 'active';
      membership = repository.create({
        ...membership,
        communityId,
        userId,
        role: membership?.role ?? 'member',
        status: nextStatus,
      });
      const saved = await repository.save(membership);
      if (!wasActive && nextStatus === 'active') {
        await manager.increment(
          Community,
          { id: communityId },
          'memberCount',
          1,
        );
      }
      return saved;
    });
    await this.cache.deleteByPrefix(`community:list:joined:${userId}:`);
    return membership;
  }
  // T: O(log C + log M) and S: O(1)

  async createInvite(
    userId: string,
    communityId: string,
    dto: CreateInviteDto,
  ): Promise<{ invite: CommunityInvite; secret?: string }> {
    await this.requireMembership(userId, communityId, ['owner', 'admin']);
    if (dto.kind === 'direct' && !dto.inviteeUserId) {
      throw new BadRequestException('Direct invitation requires a user');
    }
    if (dto.kind === 'direct' && dto.inviteeUserId) {
      await this.requireFriendship(userId, dto.inviteeUserId);
    }
    let secret: string | undefined;
    let tokenHash: string | null = null;
    let codeHash: string | null = null;
    if (dto.kind === 'link') {
      secret = crypto.randomBytes(24).toString('base64url');
      tokenHash = this.hashInviteSecret(secret);
    }
    if (dto.kind === 'code') {
      secret = crypto.randomBytes(6).toString('base64url').toUpperCase();
      codeHash = this.hashInviteSecret(secret);
    }
    const invite = await this.inviteRepository.save(
      this.inviteRepository.create({
        communityId,
        createdBy: userId,
        inviteeUserId: dto.inviteeUserId ?? null,
        tokenHash,
        codeHash,
        kind: dto.kind,
        maxUses: dto.kind === 'direct' ? 1 : dto.maxUses,
        expiresAt: new Date(Date.now() + dto.expiresInMinutes * 60_000),
      }),
    );
    return { invite, secret };
  }
  // T: O(log M) and S: O(1)

  async acceptInvite(
    userId: string,
    dto: AcceptInviteDto,
  ): Promise<CommunityMember> {
    if (Boolean(dto.token) === Boolean(dto.code)) {
      throw new BadRequestException('Provide either an invite link or code');
    }
    const hash = this.hashInviteSecret(dto.token ?? dto.code ?? '');
    const membership = await this.dataSource.transaction(async (manager) => {
      const invite = await manager.findOne(CommunityInvite, {
        where: dto.token ? { tokenHash: hash } : { codeHash: hash },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !invite ||
        invite.revokedAt ||
        invite.expiresAt <= new Date() ||
        invite.useCount >= invite.maxUses ||
        (invite.inviteeUserId && invite.inviteeUserId !== userId)
      ) {
        throw new BadRequestException('Invite is invalid or expired');
      }
      const repository = manager.getRepository(CommunityMember);
      let membership = await repository.findOneBy({
        communityId: invite.communityId,
        userId,
      });
      const wasActive = membership?.status === 'active';
      membership = repository.create({
        ...membership,
        communityId: invite.communityId,
        userId,
        role: membership?.role ?? 'member',
        status: 'active',
      });
      const saved = await repository.save(membership);
      invite.useCount += 1;
      await manager.save(invite);
      if (!wasActive) {
        await manager.increment(
          Community,
          { id: invite.communityId },
          'memberCount',
          1,
        );
      }
      return saved;
    });
    await this.cache.deleteByPrefix(`community:list:joined:${userId}:`);
    return membership;
  }
  // T: O(log I + log M) and S: O(1), where I is invitations

  async acceptDirectInvite(
    userId: string,
    inviteId: string,
  ): Promise<CommunityMember> {
    const membership = await this.dataSource.transaction(async (manager) => {
      const invite = await manager.findOne(CommunityInvite, {
        where: { id: inviteId, kind: 'direct', inviteeUserId: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !invite ||
        invite.revokedAt ||
        invite.expiresAt <= new Date() ||
        invite.useCount >= invite.maxUses
      ) {
        throw new BadRequestException('Invite is invalid or expired');
      }
      const repository = manager.getRepository(CommunityMember);
      let membership = await repository.findOneBy({
        communityId: invite.communityId,
        userId,
      });
      const wasActive = membership?.status === 'active';
      membership = repository.create({
        ...membership,
        communityId: invite.communityId,
        userId,
        role: membership?.role ?? 'member',
        status: 'active',
      });
      const saved = await repository.save(membership);
      invite.useCount += 1;
      await manager.save(invite);
      if (!wasActive) {
        await manager.increment(
          Community,
          { id: invite.communityId },
          'memberCount',
          1,
        );
      }
      return saved;
    });
    await this.cache.deleteByPrefix(`community:list:joined:${userId}:`);
    return membership;
  }
  // T: O(log I + log M) and S: O(1), where I is invitations and M is memberships

  async createPost(
    userId: string,
    communityId: string,
    dto: CreatePostDto,
  ): Promise<CommunityPost> {
    await this.requireMembership(userId, communityId);
    return this.createPostRecord(userId, communityId, dto);
  }
  // T: O(m + o) and S: O(m + o), where m is media and o is poll options

  async createGlobalPost(
    userId: string,
    dto: CreatePostDto,
  ): Promise<CommunityPost> {
    return this.createPostRecord(userId, null, dto);
  }
  // T: O(m + o) and S: O(m + o), where m is media and o is poll options

  private async createPostRecord(
    userId: string,
    communityId: string | null,
    dto: CreatePostDto,
  ): Promise<CommunityPost> {
    if (!dto.body?.trim() && !dto.media?.length && !dto.poll) {
      throw new BadRequestException('Post content is required');
    }
    if (dto.kind === 'poll' && !dto.poll) {
      throw new BadRequestException('Poll options are required');
    }
    if (dto.kind === 'poll' && (dto.body?.trim().length ?? 0) > 150) {
      throw new BadRequestException(
        'Poll questions cannot exceed 150 characters',
      );
    }
    const mediaJobs: Array<{
      mediaId: string;
      postId: string;
      userId: string;
      providerAssetId: string;
      resourceType: 'image' | 'video';
    }> = [];
    const result = await this.dataSource.transaction(async (manager) => {
      const isProcessing = Boolean(dto.media?.length);
      const post = await manager.save(
        manager.create(CommunityPost, {
          communityId,
          authorId: userId,
          kind: dto.kind,
          title: dto.title?.trim() || null,
          body: dto.body?.trim() || null,
          status: isProcessing ? 'processing' : 'published',
        }),
      );
      if (dto.media?.length) {
        const mediaRows = dto.media.map((media, index) =>
          manager.create(PostMedia, {
            postId: post.id,
            providerAssetId: media.providerAssetId,
            resourceType: media.resourceType,
            mimeType: 'pending',
            bytes: '0',
            status: 'pending',
            sortOrder: index,
          }),
        );
        const savedMedia = await manager.save(mediaRows);
        savedMedia.forEach((media) =>
          mediaJobs.push({
            mediaId: media.id,
            postId: post.id,
            userId,
            providerAssetId: media.providerAssetId,
            resourceType: media.resourceType,
          }),
        );
      }
      if (dto.poll) {
        const poll = await manager.save(
          manager.create(Poll, {
            postId: post.id,
            allowsMultiple: dto.poll.allowsMultiple,
            endsAt: dto.poll.endsAt ? new Date(dto.poll.endsAt) : null,
          }),
        );
        await manager.save(
          dto.poll.options.map((option, index) =>
            manager.create(PollOption, {
              pollId: poll.id,
              text: option.text.trim(),
              sortOrder: index,
            }),
          ),
        );
      }
      if (!isProcessing && communityId) {
        await manager.increment(Community, { id: communityId }, 'postCount', 1);
      }
      const event = await manager.save(
        manager.create(CommunityOutboxEvent, {
          eventType: communityId
            ? 'community.post.created'
            : 'global.post.created',
          payload: { postId: post.id, communityId, authorId: userId },
        }),
      );
      return { post, eventId: event.id };
    });
    const queueOperations = mediaJobs.map((data) =>
      this.queue.enqueue({ name: 'media.verify', data }),
    );
    queueOperations.push(
      this.queue.enqueue({
        name: 'outbox.dispatch',
        data: { eventId: result.eventId },
      }),
    );
    void Promise.all(queueOperations);
    await this.invalidatePostCaches(communityId);
    return result.post;
  }
  // T: O(m + o) and S: O(m + o), where m is media and o is poll options

  async updatePost(
    userId: string,
    postId: string,
    dto: UpdatePostDto,
  ): Promise<CommunityPost> {
    const body = dto.body.trim();
    if (!body) throw new BadRequestException('Post content is required');

    const post = await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CommunityPost, {
        where: { id: postId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!existing || existing.status === 'deleted') {
        throw new NotFoundException('Post not found');
      }
      if (existing.authorId !== userId) {
        throw new ForbiddenException('Only the post author can edit this post');
      }
      if (Date.now() - existing.createdAt.getTime() >= POST_EDIT_WINDOW_MS) {
        throw new ForbiddenException(
          'Posts can only be edited within 5 minutes',
        );
      }
      if (existing.kind === 'poll' && body.length > 150) {
        throw new BadRequestException(
          'Poll questions cannot exceed 150 characters',
        );
      }
      existing.body = body;
      return manager.save(existing);
    });
    await this.invalidatePostCaches(post.communityId);
    return post;
  }
  // T: O(log P) and S: O(1), where P is the number of posts

  async deletePost(userId: string, postId: string): Promise<{ success: true }> {
    const communityId = await this.dataSource.transaction(async (manager) => {
      const post = await manager.findOne(CommunityPost, {
        where: { id: postId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!post || post.status === 'deleted') {
        throw new NotFoundException('Post not found');
      }
      if (post.authorId !== userId) {
        throw new ForbiddenException(
          'Only the post author can delete this post',
        );
      }
      const wasPublished = post.status === 'published';
      post.status = 'deleted';
      post.deletedAt = new Date();
      await manager.save(post);
      if (wasPublished && post.communityId) {
        await manager
          .createQueryBuilder()
          .update(Community)
          .set({ postCount: () => 'GREATEST("postCount" - 1, 0)' })
          .where('id = :communityId', { communityId: post.communityId })
          .execute();
      }
      return post.communityId;
    });
    await this.invalidatePostCaches(communityId);
    return { success: true };
  }
  // T: O(log P) and S: O(1), where P is the number of posts

  private async hydratePosts(
    posts: CommunityPost[],
    viewerId: string,
  ): Promise<unknown[]> {
    if (posts.length === 0) return [];
    const postIds = posts.map((post) => post.id);
    const authorIds = [...new Set(posts.map((post) => post.authorId))];
    const [authors, media, polls, profiles, friendships, viewerVotes] =
      await Promise.all([
        this.userRepository.find({
          select: { id: true, name: true, email: true },
          where: { id: In(authorIds) },
        }),
        this.postMediaRepository.find({
          where: { postId: In(postIds), status: 'ready' },
          order: { sortOrder: 'ASC' },
        }),
        this.pollRepository.find({ where: { postId: In(postIds) } }),
        this.onboardingRepository.find({
          where: { userId: In(authorIds) },
        }),
        this.friendshipRepository
          .createQueryBuilder('friendship')
          .where(
            '(friendship."userLowId" = :viewerId AND friendship."userHighId" IN (:...authorIds)) OR (friendship."userHighId" = :viewerId AND friendship."userLowId" IN (:...authorIds))',
            { viewerId, authorIds },
          )
          .getMany(),
        this.postVoteRepository.find({
          where: { postId: In(postIds), userId: viewerId },
        }),
      ]);
    const pollIds = polls.map((poll) => poll.id);
    const [options, viewerPollVotes] = pollIds.length
      ? await Promise.all([
          this.pollOptionRepository.find({
            where: { pollId: In(pollIds) },
            order: { sortOrder: 'ASC' },
          }),
          this.pollVoteRepository.find({
            where: { pollId: In(pollIds), userId: viewerId },
          }),
        ])
      : [[], []];
    const authorById = new Map(authors.map((author) => [author.id, author]));
    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId, profile]),
    );
    const friendshipByAuthorId = new Map(
      friendships.map((friendship) => [
        friendship.userLowId === viewerId
          ? friendship.userHighId
          : friendship.userLowId,
        friendship,
      ]),
    );
    const voteByPostId = new Map(
      viewerVotes.map((vote) => [vote.postId, vote.value]),
    );
    const mediaByPost = new Map<string, PostMedia[]>();
    const pollByPost = new Map(polls.map((poll) => [poll.postId, poll]));
    const optionsByPoll = new Map<string, PollOption[]>();
    const viewerOptionsByPoll = new Map<string, string[]>();
    for (const item of media) {
      const current = mediaByPost.get(item.postId) ?? [];
      current.push(item);
      mediaByPost.set(item.postId, current);
    }
    for (const option of options) {
      const current = optionsByPoll.get(option.pollId) ?? [];
      current.push(option);
      optionsByPoll.set(option.pollId, current);
    }
    for (const vote of viewerPollVotes) {
      const current = viewerOptionsByPoll.get(vote.pollId) ?? [];
      current.push(vote.optionId);
      viewerOptionsByPoll.set(vote.pollId, current);
    }
    return posts.map((post) => {
      const poll = pollByPost.get(post.id);
      const author = authorById.get(post.authorId);
      const profile = profileByUserId.get(post.authorId);
      const friendship = friendshipByAuthorId.get(post.authorId);
      return {
        ...post,
        author: author
          ? {
              ...author,
              avatarUrl: profile?.profileImageUrl ?? null,
              profession:
                profile?.dedicatedRole ??
                profile?.preferredRole?.[0] ??
                profile?.currentStatus?.[0] ??
                'Anchor member',
              friendshipStatus:
                post.authorId === viewerId
                  ? 'self'
                  : friendship?.status === 'accepted'
                    ? 'accepted'
                    : friendship?.status === 'pending'
                      ? 'pending'
                      : 'none',
            }
          : null,
        viewerVote: voteByPostId.get(post.id) ?? 0,
        media: (mediaByPost.get(post.id) ?? []).map((item) => ({
          ...item,
          url: this.mediaService.createDeliveryUrl(
            item.providerAssetId,
            item.resourceType,
          ),
        })),
        poll: poll
          ? {
              ...poll,
              options: optionsByPoll.get(poll.id) ?? [],
              viewerOptionIds: viewerOptionsByPoll.get(poll.id) ?? [],
            }
          : null,
      };
    });
  }
  // T: O(l + m + o + v + f) and S: O(l + m + o + v + f), where l is posts, m is media, o is poll options, v is viewer poll votes, and f is friendship rows

  async listPosts(
    userId: string,
    communityId: string,
    query: ListQueryDto,
  ): Promise<{ items: unknown[]; nextCursor: string | null }> {
    await this.requireMembership(userId, communityId);
    const cursor = this.decodeCursor(query.cursor);
    const cacheKey = `community:posts:${communityId}:${userId}:${query.cursor ?? 'first'}:${query.limit}`;
    const cached = await this.cache.getJson<{
      items: unknown[];
      nextCursor: string | null;
    }>(cacheKey);
    if (cached) return cached;
    const builder = this.postRepository
      .createQueryBuilder('post')
      .where('post."communityId" = :communityId', { communityId })
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM polls poll
          WHERE poll."postId" = post.id
            AND poll."endsAt" IS NOT NULL
            AND poll."endsAt" <= now()
        )`,
      )
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .take(query.limit + 1);
    if (cursor) {
      builder.andWhere(
        '(post."createdAt", post.id) < (:createdAt, :id)',
        cursor,
      );
    }
    const rows = await builder.getMany();
    const hasMore = rows.length > query.limit;
    const posts = hasMore ? rows.slice(0, query.limit) : rows;
    const result = {
      items: await this.hydratePosts(posts, userId),
      nextCursor:
        hasMore && posts.length
          ? this.encodeCursor(posts[posts.length - 1])
          : null,
    };
    await this.cache.setJson(cacheKey, result, 30);
    return result;
  }
  // T: O(l + m) and S: O(l + m), where l is posts and m is media on the page

  async listGlobalPosts(
    userId: string,
    query: ListQueryDto,
  ): Promise<{ items: unknown[]; nextCursor: string | null }> {
    const cursor = this.decodeCursor(query.cursor);
    const cacheKey = `community:global-posts:${userId}:${query.cursor ?? 'first'}:${query.limit}`;
    const cached = await this.cache.getJson<{
      items: unknown[];
      nextCursor: string | null;
    }>(cacheKey);
    if (cached) return cached;
    const builder = this.postRepository
      .createQueryBuilder('post')
      .where('post."communityId" IS NULL')
      .andWhere('post.status = :status', { status: 'published' })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM polls poll
          WHERE poll."postId" = post.id
            AND poll."endsAt" IS NOT NULL
            AND poll."endsAt" <= now()
        )`,
      )
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .take(query.limit + 1);
    if (cursor) {
      builder.andWhere(
        '(post."createdAt", post.id) < (:createdAt, :id)',
        cursor,
      );
    }
    const rows = await builder.getMany();
    const hasMore = rows.length > query.limit;
    const posts = hasMore ? rows.slice(0, query.limit) : rows;
    const result = {
      items: await this.hydratePosts(posts, userId),
      nextCursor:
        hasMore && posts.length
          ? this.encodeCursor(posts[posts.length - 1])
          : null,
    };
    await this.cache.setJson(cacheKey, result, 20);
    return result;
  }
  // T: O(l + m + o + f) and S: O(l + m + o + f), where l is posts, m is media, o is poll options, and f is friendships

  async listFeed(
    userId: string,
    query: ListQueryDto,
  ): Promise<{ items: unknown[]; nextCursor: string | null }> {
    const cursor = this.decodeCursor(query.cursor);
    const cacheKey = `community:feed:${userId}:${query.cursor ?? 'first'}:${query.limit}`;
    const cached = await this.cache.getJson<{
      items: unknown[];
      nextCursor: string | null;
    }>(cacheKey);
    if (cached) return cached;
    const builder = this.postRepository
      .createQueryBuilder('post')
      .innerJoin(
        CommunityMember,
        'membership',
        'membership."communityId" = post."communityId"',
      )
      .where('membership."userId" = :userId', { userId })
      .andWhere('membership.status = :membershipStatus', {
        membershipStatus: 'active',
      })
      .andWhere('post.status = :postStatus', { postStatus: 'published' })
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM polls poll
          WHERE poll."postId" = post.id
            AND poll."endsAt" IS NOT NULL
            AND poll."endsAt" <= now()
        )`,
      )
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('post.id', 'DESC')
      .take(query.limit + 1);
    if (cursor) {
      builder.andWhere(
        '(post."createdAt", post.id) < (:createdAt, :id)',
        cursor,
      );
    }
    const rows = await builder.getMany();
    const hasMore = rows.length > query.limit;
    const posts = hasMore ? rows.slice(0, query.limit) : rows;
    const result = {
      items: await this.hydratePosts(posts, userId),
      nextCursor:
        hasMore && posts.length
          ? this.encodeCursor(posts[posts.length - 1])
          : null,
    };
    await this.cache.setJson(cacheKey, result, 20);
    return result;
  }
  // T: O(l + m + o) and S: O(l + m + o), where l is posts, m is media, and o is poll options

  async votePost(
    userId: string,
    postId: string,
    dto: VotePostDto,
  ): Promise<{ upvotes: number; downvotes: number }> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    await this.requirePostAccess(userId, post);
    const result = await this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(PostVote);
      if (dto.value === 0) await repository.delete({ postId, userId });
      else {
        await repository.upsert(
          { postId, userId, value: dto.value },
          { conflictPaths: ['postId', 'userId'] },
        );
      }
      const [upvotes, downvotes] = await Promise.all([
        repository.countBy({ postId, value: 1 }),
        repository.countBy({ postId, value: -1 }),
      ]);
      await manager.update(
        CommunityPost,
        { id: postId },
        { upvoteCount: upvotes, downvoteCount: downvotes },
      );
      return { upvotes, downvotes };
    });
    await this.invalidatePostCaches(post.communityId);
    return result;
  }
  // T: O(log V) and S: O(1), where V is votes on the post

  async createComment(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<PostComment> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    await this.requirePostAccess(userId, post);
    const comment = await this.dataSource.transaction(async (manager) => {
      if (dto.parentCommentId) {
        const parent = await manager.findOneBy(PostComment, {
          id: dto.parentCommentId,
          postId,
          status: 'published',
        });
        if (!parent) throw new BadRequestException('Parent comment not found');
        if (parent.parentCommentId) {
          throw new BadRequestException(
            'Comment nesting is limited to one reply',
          );
        }
      }
      const comment = await manager.save(
        manager.create(PostComment, {
          postId,
          authorId: userId,
          parentCommentId: dto.parentCommentId ?? null,
          body: dto.body.trim(),
        }),
      );
      await manager.increment(CommunityPost, { id: postId }, 'commentCount', 1);
      return comment;
    });
    await this.invalidatePostCaches(post.communityId);
    return comment;
  }
  // T: O(log C) and S: O(1), where C is comments

  async listComments(
    userId: string,
    postId: string,
    query: ListQueryDto,
  ): Promise<{ items: unknown[]; nextCursor: string | null }> {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');
    await this.requirePostAccess(userId, post);
    const cursor = this.decodeCursor(query.cursor);
    const builder = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment."postId" = :postId', { postId })
      .andWhere('comment.status = :status', { status: 'published' })
      .orderBy('comment.createdAt', 'DESC')
      .addOrderBy('comment.id', 'DESC')
      .take(query.limit + 1);
    if (cursor) {
      builder.andWhere(
        '(comment."createdAt", comment.id) < (:createdAt, :id)',
        cursor,
      );
    }
    const rows = await builder.getMany();
    const hasMore = rows.length > query.limit;
    const comments = hasMore ? rows.slice(0, query.limit) : rows;
    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const authors = authorIds.length
      ? await this.userRepository.find({
          select: { id: true, name: true, email: true },
          where: { id: In(authorIds) },
        })
      : [];
    const authorById = new Map(authors.map((author) => [author.id, author]));
    return {
      items: comments.map((comment) => ({
        ...comment,
        author: authorById.get(comment.authorId) ?? null,
      })),
      nextCursor:
        hasMore && comments.length
          ? this.encodeCursor(comments[comments.length - 1])
          : null,
    };
  }
  // T: O(l) and S: O(l), where l is the page size

  async votePoll(
    userId: string,
    pollId: string,
    dto: VotePollDto,
  ): Promise<PollOption[]> {
    const result = await this.dataSource.transaction(async (manager) => {
      const poll = await manager.findOne(Poll, {
        where: { id: pollId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !poll ||
        poll.status !== 'open' ||
        (poll.endsAt && poll.endsAt <= new Date())
      ) {
        throw new BadRequestException('Poll is closed');
      }
      const post = await manager.findOneBy(CommunityPost, { id: poll.postId });
      if (!post) throw new NotFoundException('Post not found');
      await this.requirePostAccess(userId, post);
      const optionIds = [...new Set(dto.optionIds)];
      if (!poll.allowsMultiple && optionIds.length > 1) {
        throw new BadRequestException('Choose one poll option');
      }
      const validOptions =
        optionIds.length === 0
          ? []
          : optionIds.length === 1
            ? await manager.findBy(PollOption, {
                pollId,
                id: optionIds[0],
              })
          : await manager
              .getRepository(PollOption)
              .createQueryBuilder('option')
              .where('option."pollId" = :pollId', { pollId })
              .andWhere('option.id IN (:...optionIds)', { optionIds })
              .getMany();
      if (validOptions.length !== optionIds.length) {
        throw new BadRequestException('Poll option is invalid');
      }
      await manager.delete(PollVote, { pollId, userId });
      if (optionIds.length) {
        await manager.save(
          optionIds.map((optionId) =>
            manager.create(PollVote, { pollId, optionId, userId }),
          ),
        );
      }
      await manager.query(
        `UPDATE poll_options o SET "voteCount" =
          (SELECT COUNT(*) FROM poll_votes v WHERE v."optionId" = o.id)
         WHERE o."pollId" = $1`,
        [pollId],
      );
      return {
        options: await manager.findBy(PollOption, { pollId }),
        communityId: post.communityId,
      };
    });
    await this.invalidatePostCaches(result.communityId);
    return result.options;
  }
  // T: O(o + log P) and S: O(o), where o is selected options and P is poll votes

  createMediaSignature(
    userId: string,
    resourceType: 'image' | 'video',
  ): Record<string, string | number> {
    return this.mediaService.createUploadSignature(userId, resourceType);
  }
  // T: O(1) and S: O(1)

  async listFriends(
    userId: string,
    search?: string,
  ): Promise<Array<Pick<User, 'id' | 'name' | 'email'>>> {
    const builder = this.userRepository
      .createQueryBuilder('user')
      .innerJoin(
        Friendship,
        'friendship',
        '(friendship."userLowId" = :userId AND friendship."userHighId" = user.id) OR (friendship."userHighId" = :userId AND friendship."userLowId" = user.id)',
        { userId },
      )
      .where('friendship.status = :status', { status: 'accepted' })
      .select(['user.id', 'user.name', 'user.email'])
      .take(50);
    if (search?.trim()) {
      builder.andWhere(
        '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)',
        { search: `%${search.trim().toLowerCase()}%` },
      );
    }
    return builder.getMany();
  }
  // T: O(l log F) and S: O(l), where l is result limit and F is friendships

  async searchPeople(
    userId: string,
    search: string,
    limit: number,
  ): Promise<
    Array<{
      id: string;
      name: string;
      handle: string;
      role: string;
      avatarUrl: string | null;
      friendshipStatus: 'none' | 'pending' | 'accepted';
    }>
  > {
    const normalized = search.trim().toLowerCase();
    const cacheKey = `community:people-search:v2:${userId}:${crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex')
      .slice(0, 20)}:${limit}`;
    const cached = await this.cache.getJson<
      Array<{
        id: string;
        name: string;
        handle: string;
        role: string;
        avatarUrl: string | null;
        friendshipStatus: 'none' | 'pending' | 'accepted';
      }>
    >(cacheKey);
    if (cached) return cached;
    const pattern = `%${normalized}%`;
    const prefix = `${normalized}%`;
    const rows = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin(
        Friendship,
        'friendship',
        '(friendship."userLowId" = CAST(:userId AS uuid) AND friendship."userHighId" = user.id) OR (friendship."userHighId" = CAST(:userId AS uuid) AND friendship."userLowId" = user.id)',
        { userId },
      )
      .where('user.id <> CAST(:userId AS uuid)', { userId })
      .andWhere(
        new Brackets((builder) => {
          builder
            .where('LOWER(user.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(user.email) LIKE :pattern', { pattern })
            .orWhere(
              `EXISTS (
                SELECT 1
                FROM onboarding_responses search_profile
                WHERE search_profile."userId" = "user"."id"::text
                  AND LOWER(COALESCE(
                    search_profile."dedicatedRole",
                    (search_profile."preferredRole")[1],
                    (search_profile."currentStatus")[1],
                    ''
                  )) LIKE :pattern
              )`,
              { pattern },
            );
        }),
      )
      .andWhere("(friendship.status IS NULL OR friendship.status <> 'blocked')")
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect(`CONCAT('@', SPLIT_PART(user.email, '@', 1))`, 'handle')
      .addSelect(
        `CASE
          WHEN friendship.status = 'accepted' THEN 'accepted'
          WHEN friendship.status = 'pending' THEN 'pending'
          ELSE 'none'
        END`,
        'friendshipStatus',
      )
      .orderBy(
        `CASE
          WHEN LOWER(user.name) = :normalized THEN 0
          WHEN LOWER(user.name) LIKE :prefix THEN 1
          WHEN LOWER(user.email) LIKE :prefix THEN 2
          ELSE 3
        END`,
        'ASC',
      )
      .addOrderBy('user.name', 'ASC')
      .setParameters({ normalized, prefix })
      .limit(limit)
      .getRawMany<{
        id: string;
        name: string;
        handle: string;
        friendshipStatus: 'none' | 'pending' | 'accepted';
      }>();
    const userIds = rows.map((row) => row.id);
    const profiles = userIds.length
      ? await this.onboardingRepository.find({
          where: { userId: In(userIds) },
          order: { createdAt: 'DESC' },
        })
      : [];
    const latestProfileByUserId = new Map<string, OnboardingResponse>();
    for (const profile of profiles) {
      if (!latestProfileByUserId.has(profile.userId)) {
        latestProfileByUserId.set(profile.userId, profile);
      }
    }
    const results = rows.map((row) => {
      const profile = latestProfileByUserId.get(row.id);
      return {
        ...row,
        role:
          profile?.dedicatedRole ??
          profile?.preferredRole?.[0] ??
          profile?.currentStatus?.[0] ??
          'Anchor member',
        avatarUrl: profile?.profileImageUrl ?? null,
      };
    });
    await this.cache.setJson(cacheKey, results, 30);
    return results;
  }
  // T: O(l log U) and S: O(l), where l is result limit and U is indexed users

  async listFriendRequests(userId: string): Promise<
    Array<{
      id: string;
      requesterId: string;
      name: string;
      handle: string;
      role: string;
      avatarUrl: string | null;
      createdAt: Date;
    }>
  > {
    const requests = await this.friendshipRepository
      .createQueryBuilder('friendship')
      .innerJoin(User, 'requester', 'requester.id = friendship."requesterId"')
      .where('friendship."addresseeId" = CAST(:userId AS uuid)', { userId })
      .andWhere('friendship.status = :status', { status: 'pending' })
      .select('friendship.id', 'id')
      .addSelect('friendship."requesterId"', 'requesterId')
      .addSelect('friendship."createdAt"', 'createdAt')
      .addSelect('requester.name', 'name')
      .addSelect(`CONCAT('@', SPLIT_PART(requester.email, '@', 1))`, 'handle')
      .orderBy('friendship."createdAt"', 'DESC')
      .limit(50)
      .getRawMany<{
        id: string;
        requesterId: string;
        name: string;
        handle: string;
        createdAt: Date;
      }>();
    const requesterIds = requests.map((request) => request.requesterId);
    const profiles = requesterIds.length
      ? await this.onboardingRepository.find({
          where: { userId: In(requesterIds) },
          order: { createdAt: 'DESC' },
        })
      : [];
    const latestProfileByUserId = new Map<string, OnboardingResponse>();
    for (const profile of profiles) {
      if (!latestProfileByUserId.has(profile.userId)) {
        latestProfileByUserId.set(profile.userId, profile);
      }
    }
    return requests.map((request) => {
      const profile = latestProfileByUserId.get(request.requesterId);
      return {
        ...request,
        role:
          profile?.dedicatedRole ??
          profile?.preferredRole?.[0] ??
          profile?.currentStatus?.[0] ??
          'Anchor member',
        avatarUrl: profile?.profileImageUrl ?? null,
      };
    });
  }
  // T: O(l log F) and S: O(l), where l is the result limit and F is friendships

  async sendFriendRequest(
    userId: string,
    dto: SendFriendRequestDto,
  ): Promise<Friendship> {
    if (userId === dto.userId) {
      throw new BadRequestException('You cannot add yourself');
    }
    const target = await this.userRepository.exist({
      where: { id: dto.userId },
    });
    if (!target) throw new NotFoundException('User not found');
    const [userLowId, userHighId] = [userId, dto.userId].sort();
    const existing = await this.friendshipRepository.findOneBy({
      userLowId,
      userHighId,
    });
    if (existing?.status === 'accepted' || existing?.status === 'blocked') {
      throw new ConflictException('Friend relationship already exists');
    }
    const friendship = await this.friendshipRepository.save(
      this.friendshipRepository.create({
        ...existing,
        userLowId,
        userHighId,
        requesterId: userId,
        addresseeId: dto.userId,
        status: 'pending',
      }),
    );
    await Promise.all([
      this.cache.deleteByPrefix(`community:people-search:${userId}:`),
      this.cache.deleteByPrefix(`community:people-search:${dto.userId}:`),
      this.cache.deleteByPrefix('community:global-posts:'),
      this.cache.deleteByPrefix('community:posts:'),
      this.cache.deleteByPrefix('community:feed:'),
    ]);
    return friendship;
  }
  // T: O(log F) and S: O(1), where F is friendships

  async resolveFriendRequest(
    userId: string,
    requestId: string,
    dto: ResolveFriendRequestDto,
  ): Promise<Friendship> {
    const friendship = await this.friendshipRepository.findOneBy({
      id: requestId,
      addresseeId: userId,
      status: 'pending',
    });
    if (!friendship) throw new NotFoundException('Friend request not found');
    friendship.status = dto.status;
    const saved = await this.friendshipRepository.save(friendship);
    await Promise.all([
      this.cache.deleteByPrefix(
        `community:people-search:${friendship.requesterId}:`,
      ),
      this.cache.deleteByPrefix(
        `community:people-search:${friendship.addresseeId}:`,
      ),
      this.cache.deleteByPrefix('community:global-posts:'),
      this.cache.deleteByPrefix('community:posts:'),
      this.cache.deleteByPrefix('community:feed:'),
    ]);
    return saved;
  }
  // T: O(log F) and S: O(1), where F is friendships

  async removeFriend(
    userId: string,
    friendId: string,
  ): Promise<{ success: true }> {
    if (userId === friendId) {
      throw new BadRequestException('You cannot remove yourself');
    }
    const [userLowId, userHighId] = [userId, friendId].sort();
    const friendship = await this.friendshipRepository.findOneBy({
      userLowId,
      userHighId,
      status: 'accepted',
    });
    if (!friendship) {
      throw new NotFoundException('Accepted friendship not found');
    }
    await this.friendshipRepository.delete(friendship.id);
    await Promise.all([
      this.cache.deleteByPrefix(
        `community:people-search:${friendship.requesterId}:`,
      ),
      this.cache.deleteByPrefix(
        `community:people-search:${friendship.addresseeId}:`,
      ),
      this.cache.deleteByPrefix('community:global-posts:'),
      this.cache.deleteByPrefix('community:posts:'),
      this.cache.deleteByPrefix('community:feed:'),
    ]);
    return { success: true };
  }
  // T: O(log F) and S: O(1), where F is friendships
}
