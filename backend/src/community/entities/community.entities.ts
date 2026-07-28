import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export type CommunityVisibility = 'public' | 'private';
export type CommunityJoinPolicy = 'open' | 'approval' | 'invite_only';
export type CommunityMemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type CommunityMemberStatus = 'active' | 'pending' | 'banned' | 'left';
export type CommunityPostKind = 'text' | 'media' | 'poll';
export type CommunityPostStatus =
  | 'processing'
  | 'published'
  | 'removed'
  | 'deleted';

@Entity('communities')
@Index('idx_communities_discover', ['status', 'visibility', 'createdAt', 'id'])
@Check(
  'chk_community_private_policy',
  `"visibility" = 'public' OR "joinPolicy" <> 'open'`,
)
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  ownerId: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 140, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 600, default: '' })
  description: string;

  @Column({ type: 'varchar', length: 16, default: 'public' })
  visibility: CommunityVisibility;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  joinPolicy: CommunityJoinPolicy;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarAssetId: string | null;

  @Column({ type: 'integer', default: 1 })
  memberCount: number;

  @Column({ type: 'integer', default: 0 })
  postCount: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active' | 'archived' | 'deleted';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

@Entity('community_members')
@Unique('uq_community_member', ['communityId', 'userId'])
@Index('idx_memberships_user_status', ['userId', 'status', 'joinedAt'])
@Index('idx_memberships_community_status', [
  'communityId',
  'status',
  'joinedAt',
])
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  communityId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 16, default: 'member' })
  role: CommunityMemberRole;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: CommunityMemberStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('friendships')
@Unique('uq_friendship_pair', ['userLowId', 'userHighId'])
@Index('idx_friendships_requester', ['requesterId', 'status'])
@Index('idx_friendships_addressee', ['addresseeId', 'status'])
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userLowId: string;

  @Column('uuid')
  userHighId: string;

  @Column('uuid')
  requesterId: string;

  @Column('uuid')
  addresseeId: string;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: 'pending' | 'accepted' | 'declined' | 'blocked';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('community_invites')
@Index('idx_community_invite_token', ['tokenHash'], {
  unique: true,
  where: '"tokenHash" IS NOT NULL',
})
@Index('idx_community_invite_code', ['codeHash'], {
  unique: true,
  where: '"codeHash" IS NOT NULL',
})
export class CommunityInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  communityId: string;

  @Column('uuid')
  createdBy: string;

  @Column('uuid', { nullable: true })
  inviteeUserId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  tokenHash: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  codeHash: string | null;

  @Column({ type: 'varchar', length: 12 })
  kind: 'link' | 'code' | 'direct';

  @Column({ type: 'integer', default: 1 })
  maxUses: number;

  @Column({ type: 'integer', default: 0 })
  useCount: number;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

@Entity('community_posts')
@Index('idx_community_posts_feed', ['communityId', 'status', 'createdAt', 'id'])
@Index('idx_community_posts_author', ['authorId', 'createdAt'])
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  communityId: string | null;

  @Column('uuid')
  authorId: string;

  @Column({ type: 'varchar', length: 12, default: 'text' })
  kind: CommunityPostKind;

  @Column({ type: 'varchar', length: 180, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Column({ type: 'varchar', length: 16, default: 'published' })
  status: CommunityPostStatus;

  @Column({ type: 'integer', default: 0 })
  upvoteCount: number;

  @Column({ type: 'integer', default: 0 })
  downvoteCount: number;

  @Column({ type: 'integer', default: 0 })
  commentCount: number;

  @Column({ type: 'bigint', default: 0 })
  viewCount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

@Entity('post_media')
@Index('idx_post_media_post', ['postId', 'sortOrder'])
export class PostMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column({ type: 'varchar', length: 20, default: 'cloudinary' })
  provider: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  providerAssetId: string;

  @Column({ type: 'varchar', length: 12 })
  resourceType: 'image' | 'video';

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  bytes: string;

  @Column({ type: 'integer', nullable: true })
  width: number | null;

  @Column({ type: 'integer', nullable: true })
  height: number | null;

  @Column({ type: 'integer', nullable: true })
  durationMs: number | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: 'pending' | 'ready' | 'failed' | 'quarantined';

  @Column({ type: 'smallint', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

@Entity('polls')
@Unique('uq_poll_post', ['postId'])
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column({ type: 'boolean', default: false })
  allowsMultiple: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ type: 'varchar', length: 12, default: 'open' })
  status: 'open' | 'closed';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

@Entity('poll_options')
@Index('idx_poll_options_poll', ['pollId', 'sortOrder'])
export class PollOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pollId: string;

  @Column({ type: 'varchar', length: 180 })
  text: string;

  @Column({ type: 'integer', default: 0 })
  voteCount: number;

  @Column({ type: 'smallint' })
  sortOrder: number;
}

@Entity('poll_votes')
@Unique('uq_poll_vote_option_user', ['pollId', 'optionId', 'userId'])
@Index('idx_poll_vote_user', ['pollId', 'userId'])
export class PollVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  pollId: string;

  @Column('uuid')
  optionId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

@Entity('post_votes')
@Unique('uq_post_vote_user', ['postId', 'userId'])
@Check('chk_post_vote_value', '"value" IN (-1, 1)')
export class PostVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'smallint' })
  value: -1 | 1;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('post_comments')
@Index('idx_post_comments_post', ['postId', 'createdAt', 'id'])
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  authorId: string;

  @Column('uuid', { nullable: true })
  parentCommentId: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 12, default: 'published' })
  status: 'published' | 'removed' | 'deleted';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('community_outbox_events')
@Index('idx_outbox_pending', ['processedAt', 'createdAt'])
export class CommunityOutboxEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
