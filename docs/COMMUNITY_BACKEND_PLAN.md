# Anchor Community Backend Plan

## 1. Goal and current baseline

Build the Community backend incrementally on the existing Anchor stack:

- NestJS 11
- TypeORM
- PostgreSQL
- JWT authentication in an `access_token` cookie
- Cloudinary integration
- Next.js community UI, currently backed by static sample data

The first release is a modular monolith. This keeps transactions and deployment
simple while giving each domain a clean boundary. We should split services only
after measurements show a real scaling bottleneck.

Implementation has started. The delivered foundation and its current boundaries
are tracked in `COMMUNITY_BACKEND_IMPLEMENTATION.md`.

## 2. Required code convention

Every new named function, method, and non-trivial callback written for the
Community section must have a complexity comment immediately after the function:

```ts
function example(items: Item[]): Item[] {
  return items.filter((item) => item.enabled);
}
// T: O(n) and S: O(n)
```

For a class method, place the comment after the closing brace of the method and
before the next method. Complexity must describe application work and should
also note database cost when that is more useful:

```ts
async findCommunity(id: string): Promise<Community> {
  return this.communityRepository.findOneByOrFail({ id });
}
// T: O(log C) with the primary-key index and S: O(1)
```

Here, `C` is the number of communities. Similar symbols should be documented
near the relevant service.

Generated migration `up` and `down` methods are included in this rule. Tiny
framework constructors may use `T: O(1) and S: O(1)`.

## 3. Architecture

```text
Next.js client
     |
     | HTTPS + JWT cookie + CSRF protection
     v
NestJS Community module (stateless)
     |
     +---- PostgreSQL: source of truth and transactions
     |
     +---- Redis: cache, rate limits, and BullMQ queues
     |
     +---- Cloudinary: image/video storage and transformation
     |
     +---- Worker: media processing, counters, notifications, outbox jobs
```

Initial NestJS module boundaries:

- `communities`: create, update, discover, and delete/soft-delete communities
- `memberships`: roles, joins, leaves, bans, and authorization
- `invites`: links, codes, direct friend invitations, expiry, and revocation
- `friends`: friend requests and accepted friendships
- `community-posts`: text posts, media metadata, polls, comments, and votes
- `community-feed`: cursor pagination and feed ranking
- `community-moderation`: reports, removal, and audit records
- `community-notifications`: asynchronous in-app invitation/activity events

These remain modules in the existing NestJS deployment, not separate
microservices.

## 4. Data model

Use UUID primary keys, `timestamptz`, foreign keys, explicit unique constraints,
and TypeORM migrations. Do not use TypeORM `synchronize: true` outside local
development.

### Core tables

#### `communities`

- `id`
- `owner_id -> users.id`
- `name`
- `slug` (unique, normalized)
- `description`
- `visibility`: `public | private`
- `join_policy`: `open | approval | invite_only`
- `avatar_asset_id` (nullable)
- `member_count` (denormalized counter)
- `post_count` (denormalized counter)
- `status`: `active | archived | deleted`
- `created_at`, `updated_at`, `deleted_at`

Rule: a private community cannot use `open`. Public communities may use `open`
or `approval`.

#### `community_members`

- `community_id -> communities.id`
- `user_id -> users.id`
- `role`: `owner | admin | moderator | member`
- `status`: `active | pending | banned | left`
- `joined_at`, `updated_at`
- unique `(community_id, user_id)`

The membership row is the authorization source of truth. The owner also has a
membership row with role `owner`.

#### `friendships`

- `requester_id -> users.id`
- `addressee_id -> users.id`
- `status`: `pending | accepted | blocked | declined`
- `created_at`, `updated_at`
- a canonical pair key prevents duplicate/reversed relationships

Friend invitations are allowed only for an accepted friendship.

#### `community_invites`

- `id`
- `community_id`
- `created_by`
- `invitee_user_id` (nullable for shareable links/codes)
- `token_hash` (nullable, never store a raw link token)
- `code_hash` (nullable, never store the raw code)
- `kind`: `link | code | direct`
- `max_uses`, `use_count`
- `expires_at`, `revoked_at`, `created_at`

Use a cryptographically random token with at least 128 bits of entropy. Return
the raw secret only when it is created; store an HMAC/SHA-256 hash. Accepting an
invite, incrementing its usage, and creating membership happen in one database
transaction with row locking.

### Content tables

#### `community_posts`

- `id`, `community_id`, `author_id`
- `kind`: `text | media | poll`
- `title` (nullable), `body` (nullable)
- `status`: `processing | published | removed | deleted`
- `upvote_count`, `downvote_count`, `comment_count`, `view_count`
- `hot_score` (optional precomputed ranking value)
- `created_at`, `updated_at`, `deleted_at`

#### `post_media`

- `id`, `post_id`
- `provider`: initially `cloudinary`
- `provider_asset_id`
- `resource_type`: `image | video`
- `mime_type`, `bytes`, `width`, `height`, `duration_ms`
- `status`: `pending | ready | failed | quarantined`
- `sort_order`, `created_at`

Do not store media bytes in PostgreSQL.

#### `polls`, `poll_options`, and `poll_votes`

- one `polls` row per poll post, including `ends_at`, `allows_multiple`, and
  `status`
- ordered `poll_options`
- `poll_votes` with unique `(poll_id, option_id, user_id)`
- for single-choice polls, enforce one vote per `(poll_id, user_id)` using a
  database constraint/design rather than application-only checks

Vote insertion and counter updates use a transaction. Whether votes can be
changed must be decided before implementation.

#### `post_votes`

- `post_id`, `user_id`, `value` (`1` or `-1`), `updated_at`
- unique `(post_id, user_id)`

An upvote/downvote change is one transaction. Counters are fast read models;
the unique vote row is the truth and supports reconciliation.

#### `post_comments`

- `id`, `post_id`, `author_id`, `parent_comment_id` (nullable)
- `body`, `status`, `created_at`, `updated_at`, `deleted_at`

Limit nesting depth in the service to avoid unbounded recursive reads.

#### Reliability and moderation

- `outbox_events`: reliably records jobs/events in the same transaction as
  state changes
- `notifications`: in-app notification state
- `community_reports`: user reports
- `moderation_actions`: immutable moderator audit trail

## 5. Essential indexes

- `communities(status, visibility, created_at desc, id desc)`
- trigram or full-text index for normalized community name/description search
- `community_members(user_id, status, joined_at desc)`
- `community_members(community_id, status, joined_at desc)`
- `community_posts(community_id, status, created_at desc, id desc)`
- `community_posts(author_id, created_at desc)`
- `post_comments(post_id, created_at asc, id asc)`
- `community_invites(token_hash)` and `community_invites(code_hash)`
- partial indexes for active memberships, published posts, and live invites

All list endpoints use cursor/keyset pagination. Avoid `OFFSET` for large feeds.
The cursor contains the last sort value plus ID and is signed/validated.

## 6. API contract (versioned)

Use `/api/v1` for new Community routes.

### Communities and membership

- `POST /api/v1/communities`
- `GET /api/v1/communities?scope=joined|discover&cursor=...`
- `GET /api/v1/communities/:communityId`
- `PATCH /api/v1/communities/:communityId`
- `POST /api/v1/communities/:communityId/join`
- `POST /api/v1/communities/:communityId/join-requests/:userId/approve`
- `DELETE /api/v1/communities/:communityId/members/me`
- `GET /api/v1/communities/:communityId/members?cursor=...`
- `PATCH /api/v1/communities/:communityId/members/:userId`

Creation accepts the community name, description/visibility/policy, and optional
friend IDs. Community creation, owner membership, and direct invitations are
committed atomically.

### Friends and invitations

- `POST /api/v1/friends/requests`
- `PATCH /api/v1/friends/requests/:requestId`
- `GET /api/v1/friends?cursor=...`
- `POST /api/v1/communities/:communityId/invites`
- `POST /api/v1/community-invites/accept` (raw token or code in request body)
- `DELETE /api/v1/communities/:communityId/invites/:inviteId`

Never put a short join code in a URL query string. Link tokens may be in a route
but must be redacted from application and proxy logs.

### Posts, polls, and media

- `POST /api/v1/communities/:communityId/posts`
- `GET /api/v1/communities/:communityId/posts?cursor=...`
- `GET /api/v1/community-feed?cursor=...`
- `GET /api/v1/posts/:postId`
- `DELETE /api/v1/posts/:postId`
- `PUT /api/v1/posts/:postId/vote`
- `POST /api/v1/posts/:postId/comments`
- `GET /api/v1/posts/:postId/comments?cursor=...`
- `PUT /api/v1/polls/:pollId/vote`
- `POST /api/v1/media/upload-signature`
- `POST /api/v1/media/complete`

The client uploads image/video bytes directly to Cloudinary using a short-lived,
server-generated signed upload. The API receives metadata and provider asset ID,
validates ownership/signature, and publishes the post after processing succeeds.
This avoids buffering large videos through the NestJS server.

All mutation endpoints accept an idempotency key so mobile retries do not create
duplicate communities, posts, memberships, or votes.

## 7. System-design decisions

### Scalability

- Start with a modular monolith and stateless API containers.
- PostgreSQL remains the source of truth; use connection pooling.
- Use cursor pagination and covering indexes to keep work bounded.
- Upload media directly to object/media storage.
- Move video processing, notifications, counter repair, and thumbnail work to
  BullMQ workers.
- Use an outbox worker so database commits and async events cannot diverge.
- Cache only read-heavy derived responses, never membership authorization.
- Partition `community_posts`, `post_comments`, or events by time only when table
  size and query plans justify it.

### Availability and consistency

Use strong consistency for:

- community creation
- owner/member roles and bans
- join/invite redemption and use limits
- post/poll vote uniqueness
- permission checks

Use eventual consistency for:

- displayed member/post/view counters
- notifications
- feed ranking
- thumbnails/transcoding
- search results

If Redis is unavailable, core reads/writes should still use PostgreSQL. Rate
limiting may fail closed on sensitive invite/auth actions and fail open with
local limits on ordinary feed reads. A free deployment cannot honestly promise
multi-zone HA or an SLA; production HA requires replicated managed services or
operational ownership of replicas/backups.

### Security

- Add a global `ValidationPipe` with whitelist and transform enabled.
- Add `helmet`, strict environment-driven CORS, request-size limits, and
  structured redacted logs.
- Because auth uses cookies, use `HttpOnly`, `Secure`, and appropriate `SameSite`
  settings plus CSRF protection for state-changing routes.
- Add authorization guards for active membership and role. Every resource lookup
  must scope by authorized community to prevent IDOR.
- Validate MIME type from file signatures, not only filenames/headers; cap image
  and video size/duration; reject unsupported codecs.
- Use private/authenticated media plus short-lived signed delivery URLs for
  private communities. A public Cloudinary URL would defeat community privacy.
- Sanitize rendered text and links; store plain text or a restricted structured
  format, not arbitrary HTML.
- Hash invite secrets, set expiry/max-use/revocation, rate-limit code attempts,
  and audit admin/moderator actions.
- Use parameterized TypeORM queries, secret rotation, least-privilege database
  credentials, encrypted backups, dependency scanning, and moderation/reporting.

### Latency

- Target p95 under 250 ms for cached feed/community reads, excluding media
  delivery, and under 500 ms for normal writes.
- Put API, PostgreSQL, Redis, and media region near the initial user base.
- Return compact projections instead of full ORM graphs.
- Fetch author/community summaries in a join or batch; avoid N+1 queries.
- Cache discover lists and post summaries for 30–120 seconds with versioned keys.
- Use CDN/media transformations for responsive images and adaptive video.
- Do not increment `view_count` synchronously for every impression; aggregate
  deduplicated view events asynchronously.

## 8. Free/open-source tools

Use the tools already present before adding vendors:

- PostgreSQL + TypeORM migrations: durable source of truth
- Cloudinary free plan: initial image/video upload, transformation, and delivery
- Redis locally in Docker; Upstash free Redis is acceptable for a prototype
  cache/queue/rate limiter but is not an HA production promise
- BullMQ: open-source asynchronous jobs on Redis
- `@nestjs/throttler`: application rate limits
- Helmet + `class-validator`: secure headers and DTO validation
- Pino/OpenTelemetry: structured logs and traces
- Prometheus + Grafana OSS: local/self-hosted metrics dashboards
- Jest + Supertest + Testcontainers: unit, integration, and e2e tests
- k6: feed/join/vote load tests
- ClamAV and FFmpeg/ffprobe workers where media validation or inspection is
  required

Alternative for media growth: Cloudflare R2 has an S3-compatible API, a monthly
free allowance, and no egress charge, but it does not replace Cloudinary's
image/video transformation pipeline. Hide the provider behind a
`CommunityMediaStorage` interface so it can be changed later.

## 9. Delivery phases

### Phase 0 — foundation and UI contract

- finalize UI behavior and response shapes
- add migrations and disable schema synchronization outside local development
- add `/api/v1`, validation, error envelope, request IDs, security headers,
  CSRF decision, and test database
- document complexity symbols and enforce the comment convention in reviews

Exit: backend foundation tests pass; no Community feature yet.

### Phase 1 — communities, friends, and membership

- communities and membership schema
- create public/private community
- optional direct friend invitations during creation
- public discovery/join, approval flow, leave, member roles
- friend request/accept/list

Exit: authorization and concurrency integration tests pass.

### Phase 2 — invite links, codes, and direct invitations

- secure invite generation/redemption/revocation
- expiry and usage limits
- atomic acceptance under concurrent requests
- redacted logs and abuse rate limits

Exit: a private community cannot be read or joined without valid membership or a
successfully redeemed invite.

### Phase 3 — text posts and feed

- create/read/delete text posts
- joined-community aggregate feed
- comments and post votes
- cursor pagination and required indexes

Exit: no N+1 query path; pagination has no duplicates/gaps in concurrency tests.

### Phase 4 — images and videos

- signed direct upload
- media validation and processing state
- private delivery URLs
- async completion/failure cleanup

Exit: unauthorized users cannot fetch private media; failed uploads are cleaned.

### Phase 5 — polls

- options, end time, single/multiple selection policy
- atomic voting/change-vote behavior
- results visibility policy and reconciliation

Exit: uniqueness and close-time behavior pass concurrent vote tests.

### Phase 6 — hardening and scale validation

- reports/moderation/audit log
- Redis cache, BullMQ, outbox, and notifications
- backups/restore rehearsal, dashboards, alerts
- k6 tests for feed, joins, invite redemption, posts, and votes
- query-plan review with realistic seed volume

Exit: agreed p95/error targets pass and recovery procedures are documented.

## 10. Testing requirements

- unit tests for policy/authorization, invite hashing, cursor encoding, and
  validation
- PostgreSQL integration tests for constraints and transactions
- e2e tests using real JWT cookie behavior
- concurrency tests for joining, last invite use, ownership, and poll/post votes
- security tests for private-community IDOR, revoked/expired invites, CSRF,
  upload spoofing, XSS payloads, and rate limiting
- load tests with realistic membership/post distributions, not uniform mock data

## 11. Decisions needed just before their phase

We do not need to block Phase 1 on every future choice. Confirm these when the
relevant phase begins:

- whether public communities are open by default or may require approval
- whether a community may have multiple owners
- whether users can rejoin after leaving and who can unban
- invite expiry, max uses, and code length
- allowed media size/duration and number of assets per post
- whether post votes and poll votes can be changed
- when poll results become visible
- feed order: newest first for MVP, then ranked if measurements justify it
- comment nesting depth and edit window
