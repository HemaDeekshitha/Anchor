import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCommunitySchema1753650000000 implements MigrationInterface {
  name = 'CreateCommunitySchema1753650000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "ownerId" uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        name varchar(120) NOT NULL,
        slug varchar(140) NOT NULL UNIQUE,
        description varchar(600) NOT NULL DEFAULT '',
        visibility varchar(16) NOT NULL DEFAULT 'public',
        "joinPolicy" varchar(20) NOT NULL DEFAULT 'open',
        "avatarAssetId" varchar(255),
        "memberCount" integer NOT NULL DEFAULT 1 CHECK ("memberCount" >= 0),
        "postCount" integer NOT NULL DEFAULT 0 CHECK ("postCount" >= 0),
        status varchar(16) NOT NULL DEFAULT 'active',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT chk_community_private_policy
          CHECK (visibility = 'public' OR "joinPolicy" <> 'open'),
        CONSTRAINT chk_community_visibility
          CHECK (visibility IN ('public', 'private')),
        CONSTRAINT chk_community_join_policy
          CHECK ("joinPolicy" IN ('open', 'approval', 'invite_only')),
        CONSTRAINT chk_community_status
          CHECK (status IN ('active', 'archived', 'deleted'))
      );
      CREATE INDEX IF NOT EXISTS idx_communities_discover
        ON communities(status, visibility, "createdAt" DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_communities_owner ON communities("ownerId");
      CREATE INDEX IF NOT EXISTS idx_communities_search
        ON communities USING gin
        ((lower(name || ' ' || description)) gin_trgm_ops);

      CREATE TABLE IF NOT EXISTS community_members (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "communityId" uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role varchar(16) NOT NULL DEFAULT 'member',
        status varchar(16) NOT NULL DEFAULT 'active',
        "joinedAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_community_member UNIQUE ("communityId", "userId"),
        CONSTRAINT chk_community_member_role
          CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
        CONSTRAINT chk_community_member_status
          CHECK (status IN ('active', 'pending', 'banned', 'left'))
      );
      CREATE INDEX IF NOT EXISTS idx_memberships_user_status
        ON community_members("userId", status, "joinedAt" DESC);
      CREATE INDEX IF NOT EXISTS idx_memberships_community_status
        ON community_members("communityId", status, "joinedAt" DESC);

      CREATE TABLE IF NOT EXISTS friendships (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userLowId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "userHighId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "requesterId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "addresseeId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status varchar(16) NOT NULL DEFAULT 'pending',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_friendship_pair UNIQUE ("userLowId", "userHighId"),
        CONSTRAINT chk_friendship_order CHECK ("userLowId" < "userHighId"),
        CONSTRAINT chk_friendship_status
          CHECK (status IN ('pending', 'accepted', 'declined', 'blocked'))
      );
      CREATE INDEX IF NOT EXISTS idx_friendships_requester
        ON friendships("requesterId", status);
      CREATE INDEX IF NOT EXISTS idx_friendships_addressee
        ON friendships("addresseeId", status);

      CREATE TABLE IF NOT EXISTS community_invites (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "communityId" uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        "createdBy" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "inviteeUserId" uuid REFERENCES users(id) ON DELETE CASCADE,
        "tokenHash" varchar(64),
        "codeHash" varchar(64),
        kind varchar(12) NOT NULL,
        "maxUses" integer NOT NULL DEFAULT 1 CHECK ("maxUses" > 0),
        "useCount" integer NOT NULL DEFAULT 0 CHECK ("useCount" >= 0),
        "expiresAt" timestamptz NOT NULL,
        "revokedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_community_invite_kind
          CHECK (kind IN ('link', 'code', 'direct')),
        CONSTRAINT chk_community_invite_shape CHECK (
          (kind = 'link' AND "tokenHash" IS NOT NULL AND "codeHash" IS NULL)
          OR (kind = 'code' AND "codeHash" IS NOT NULL AND "tokenHash" IS NULL)
          OR (
            kind = 'direct' AND "inviteeUserId" IS NOT NULL
            AND "tokenHash" IS NULL AND "codeHash" IS NULL
          )
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_invite_token
        ON community_invites("tokenHash") WHERE "tokenHash" IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_invite_code
        ON community_invites("codeHash") WHERE "codeHash" IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_community_invites_community
        ON community_invites("communityId", "createdAt" DESC);

      CREATE TABLE IF NOT EXISTS community_posts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "communityId" uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        "authorId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind varchar(12) NOT NULL DEFAULT 'text',
        title varchar(180),
        body text,
        status varchar(16) NOT NULL DEFAULT 'published',
        "upvoteCount" integer NOT NULL DEFAULT 0 CHECK ("upvoteCount" >= 0),
        "downvoteCount" integer NOT NULL DEFAULT 0 CHECK ("downvoteCount" >= 0),
        "commentCount" integer NOT NULL DEFAULT 0 CHECK ("commentCount" >= 0),
        "viewCount" bigint NOT NULL DEFAULT 0 CHECK ("viewCount" >= 0),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "deletedAt" timestamptz,
        CONSTRAINT chk_community_post_kind
          CHECK (kind IN ('text', 'media', 'poll')),
        CONSTRAINT chk_community_post_status
          CHECK (status IN ('processing', 'published', 'removed', 'deleted')),
        CONSTRAINT chk_community_post_content
          CHECK (body IS NOT NULL OR title IS NOT NULL OR kind IN ('media', 'poll'))
      );
      CREATE INDEX IF NOT EXISTS idx_community_posts_feed
        ON community_posts("communityId", status, "createdAt" DESC, id DESC);
      CREATE INDEX IF NOT EXISTS idx_community_posts_author
        ON community_posts("authorId", "createdAt" DESC);

      CREATE TABLE IF NOT EXISTS post_media (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        provider varchar(20) NOT NULL DEFAULT 'cloudinary',
        "providerAssetId" varchar(255) NOT NULL UNIQUE,
        "resourceType" varchar(12) NOT NULL,
        "mimeType" varchar(100) NOT NULL,
        bytes bigint NOT NULL,
        width integer,
        height integer,
        "durationMs" integer,
        status varchar(16) NOT NULL DEFAULT 'pending',
        "sortOrder" smallint NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_post_media_resource
          CHECK ("resourceType" IN ('image', 'video')),
        CONSTRAINT chk_post_media_status
          CHECK (status IN ('pending', 'ready', 'failed', 'quarantined'))
      );
      CREATE INDEX IF NOT EXISTS idx_post_media_post
        ON post_media("postId", "sortOrder");

      CREATE TABLE IF NOT EXISTS polls (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL UNIQUE REFERENCES community_posts(id) ON DELETE CASCADE,
        "allowsMultiple" boolean NOT NULL DEFAULT false,
        "endsAt" timestamptz,
        status varchar(12) NOT NULL DEFAULT 'open',
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS poll_options (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "pollId" uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        text varchar(180) NOT NULL,
        "voteCount" integer NOT NULL DEFAULT 0 CHECK ("voteCount" >= 0),
        "sortOrder" smallint NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_poll_options_poll
        ON poll_options("pollId", "sortOrder");
      CREATE TABLE IF NOT EXISTS poll_votes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "pollId" uuid NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
        "optionId" uuid NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_poll_vote_option_user UNIQUE ("pollId", "optionId", "userId")
      );
      CREATE INDEX IF NOT EXISTS idx_poll_vote_user
        ON poll_votes("pollId", "userId");

      CREATE TABLE IF NOT EXISTS post_votes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        value smallint NOT NULL CHECK (value IN (-1, 1)),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_post_vote_user UNIQUE ("postId", "userId")
      );
      CREATE TABLE IF NOT EXISTS post_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
        "authorId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "parentCommentId" uuid REFERENCES post_comments(id) ON DELETE CASCADE,
        body text NOT NULL,
        status varchar(12) NOT NULL DEFAULT 'published',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_post_comments_post
        ON post_comments("postId", "createdAt", id);

      CREATE TABLE IF NOT EXISTS community_outbox_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "eventType" varchar(80) NOT NULL,
        payload jsonb NOT NULL,
        attempts integer NOT NULL DEFAULT 0,
        "processedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_outbox_pending
        ON community_outbox_events("processedAt", "createdAt")
        WHERE "processedAt" IS NULL;
    `);
  }
  // T: O(1) schema operations relative to application data and S: O(1)

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS community_outbox_events CASCADE;
      DROP TABLE IF EXISTS post_comments CASCADE;
      DROP TABLE IF EXISTS post_votes CASCADE;
      DROP TABLE IF EXISTS poll_votes CASCADE;
      DROP TABLE IF EXISTS poll_options CASCADE;
      DROP TABLE IF EXISTS polls CASCADE;
      DROP TABLE IF EXISTS post_media CASCADE;
      DROP TABLE IF EXISTS community_posts CASCADE;
      DROP TABLE IF EXISTS community_invites CASCADE;
      DROP TABLE IF EXISTS friendships CASCADE;
      DROP TABLE IF EXISTS community_members CASCADE;
      DROP TABLE IF EXISTS communities CASCADE;
    `);
  }
  // T: O(1) schema operations relative to application data and S: O(1)
}
