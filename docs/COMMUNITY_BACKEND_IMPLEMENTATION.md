# Community Backend Implementation

## Delivered foundation

The Community backend is implemented as a bounded module inside the existing
NestJS application. This is intentionally a modular monolith: PostgreSQL
transactions remain simple, the API stays stateless, and API/worker capacity can
scale independently without paying the operational cost of microservices.

The implementation includes:

- PostgreSQL entities and an explicit TypeORM migration
- public/private communities, memberships, approval-ready membership state,
  accepted friendships, direct/link/code invites, posts, Cloudinary media,
  polls, votes, comments, denormalized counters, and transactional outbox events
- signed keyset cursors instead of `OFFSET` pagination
- Redis response caching and distributed per-user/per-route rate limiting
- BullMQ queues, a separately deployable worker, retry/backoff, and recovery
  scans for work that was committed while Redis was temporarily unavailable
- direct-to-Cloudinary authenticated uploads and short-lived signed delivery
  URLs; image/video bytes never pass through NestJS or PostgreSQL
- global DTO validation, Helmet headers, strict credentialed CORS, mutation
  origin checks, JWT cookie authentication, proxy trust, readiness checks, and
  HTTPS termination guidance for Nginx
- PostgreSQL connection-pool and timeout configuration

Every new Community function and method has the required complexity comment.

## Runtime architecture

```text
Browser
  |
  | HTTPS; HttpOnly JWT cookie
  v
Nginx (TLS, edge limit, least-connections upstream)
  |
  +--> NestJS API replica(s) ----> PostgreSQL (source of truth)
             |                         |
             |                         +--> transactional state and outbox
             v
           Redis <---------------- BullMQ worker replica(s)
             |                           |
             +-- short-lived cache       +-- media verification
             +-- rate-limit counters     +-- counter repair
                                         +-- outbox/recovery jobs

Browser -------- signed direct upload --------> Cloudinary
Browser <------- signed transformed media ----- Cloudinary CDN
```

## Tables and consistency

The migration creates:

- `communities`
- `community_members`
- `friendships`
- `community_invites`
- `community_posts`
- `post_media`
- `polls`
- `poll_options`
- `poll_votes`
- `post_votes`
- `post_comments`
- `community_outbox_events`

Foreign keys, canonical friendship pairs, unique membership/vote constraints,
state checks, invite-shape checks, and counter non-negativity are enforced in
PostgreSQL. The application uses row locks for join/invite redemption and poll
voting. Membership and invitation use counts are strongly consistent.

Displayed counters, cached feeds, media readiness, and event delivery are
eventually consistent. Authoritative vote and membership rows can be used to
repair their counters. Cache failures never replace database authorization.

## Implemented APIs

All Community APIs are cookie-authenticated and versioned under `/api/v1`.

### Communities and invitations

- `POST /api/v1/communities`
- `GET /api/v1/communities?scope=joined|discover`
- `GET /api/v1/communities/:communityId`
- `POST /api/v1/communities/:communityId/join`
- `POST /api/v1/communities/:communityId/invites`
- `POST /api/v1/community-invites/accept`
- `POST /api/v1/community-invites/:inviteId/accept`

### Posts, media, polls, and comments

- `GET /api/v1/community-feed`
- `POST /api/v1/communities/:communityId/posts`
- `GET /api/v1/communities/:communityId/posts`
- `POST /api/v1/posts/:postId/vote`
- `POST /api/v1/posts/:postId/comments`
- `GET /api/v1/posts/:postId/comments`
- `POST /api/v1/polls/:pollId/vote`
- `POST /api/v1/community-media/upload-signature`

### Friends

- `GET /api/v1/friends?search=...`
- `POST /api/v1/friends/requests`
- `PATCH /api/v1/friends/requests/:requestId`

Cursor list endpoints are capped at 50 rows. Mutation/read budgets are enforced
through Redis using stable controller-method keys plus the authenticated user
ID, so API replicas share the same counters.

## Media flow

1. The browser requests a short-lived authenticated Cloudinary upload
   signature.
2. The browser uploads bytes directly to Cloudinary.
3. The browser creates a post containing only the returned provider asset ID.
4. PostgreSQL stores metadata with `pending` status and the post remains
   `processing`.
5. BullMQ verifies that the asset is inside the user's folder, checks size and
   type metadata, and marks it ready.
6. The final media job publishes the post and increments its community counter
   in one locked transaction.
7. Reads receive a short-lived signed CDN URL with image optimization.

Current limits are 10 MB per image, 100 MB per video, and six media items per
post. Nginx's request body limit remains small because media bytes bypass the
API.

## Scalability and latency decisions

- API state is externalized to PostgreSQL/Redis, so additional API replicas can
  be added behind Nginx.
- Worker concurrency is eight per process and workers can scale separately.
- Keyset pagination and composite indexes keep query work bounded.
- Feed hydration batches users, media, polls, and options, avoiding N+1 queries.
- Community search uses PostgreSQL `pg_trgm`; a separate search service is not
  needed at the current scale.
- PostgreSQL pooling defaults to 20 production connections per API/worker
  process. The total across replicas must remain below the database limit; use
  PgBouncer when replicas would exceed it.
- Cache TTLs are deliberately short (20–45 seconds) and writes invalidate
  affected community/list prefixes.
- Cloudinary handles media CDN delivery, transformation, and range requests.

## Availability boundaries

Redis is configured with AOF locally and the queue recovery service scans
PostgreSQL every 30 seconds for pending media/outbox work. This prevents a
temporary enqueue failure from permanently stranding a post.

The included Compose deployment still runs one Redis and depends on the
externally configured PostgreSQL. That is fault recovery, not high availability.
Real HA requires PostgreSQL replication/backups and a replicated or managed
Redis service. Free single-node tooling cannot provide a truthful multi-zone
SLA.

## HTTPS, JWT cookies, and request security

NestJS trusts exactly one reverse-proxy hop. Nginx forwards the client IP and
`X-Forwarded-Proto`, redirects HTTP to HTTPS, supports TLS 1.2/1.3, adds HSTS,
and retries safe upstream failures. Existing access/refresh JWTs are stored in
`HttpOnly` cookies; production cookies are `Secure`. Credentialed CORS uses an
explicit environment allow-list, and state-changing requests with an unexpected
Origin are rejected.

Secrets must be supplied through deployment environment variables, never
committed. At minimum:

```text
DATABASE_HOST DATABASE_PORT DATABASE_USER DATABASE_PASSWORD DATABASE_NAME
DATABASE_SSL REDIS_URL
JWT_ACCESS_SECRET JWT_REFRESH_SECRET
CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY CLOUDINARY_API_SECRET
CORS_ORIGINS FRONTEND_URL
```

An independent `INVITE_HASH_SECRET` and `CURSOR_SIGNING_SECRET` are recommended;
the implementation falls back to the access-token secret if they are absent.

## Nginx assessment

No Nginx configuration was present in this repository or in the standard local
Nginx paths during implementation, so the currently deployed proxy and
certificate state could not be inspected. The checked-in
`infra/nginx/anchor-api.conf.example` provides:

- HTTP-to-HTTPS redirect and Let's Encrypt challenge path
- TLS configuration and HSTS
- `least_conn`, keepalive, health failure thresholds, and retry rules
- forwarded protocol/IP headers required by NestJS
- an edge request limit and a small body-size limit

With only `127.0.0.1:3012` active, Nginx is a reverse proxy, not a load
balancer. Enable a second healthy API instance (the example shows port 3015)
before uncommenting the second upstream. Run `nginx -t` before reloading the
server.

## Free/local tooling

- PostgreSQL and `pg_trgm`: relational truth, transactions, indexed search
- Redis: cache, shared limits, and BullMQ transport
- BullMQ: retries and background processing
- Nginx: TLS termination and load balancing
- Let's Encrypt/Certbot: free certificates
- Docker Compose: reproducible local/development topology
- Cloudinary free tier: suitable for development and an early release, subject
  to current account storage, transformation, and bandwidth quotas

## Runbook

Build before running migrations:

```bash
cd backend
npm run build
npm run migration:run
```

Production workers use:

```bash
npm run start:worker
```

Validate deployment configuration before release:

```bash
docker compose config --quiet
nginx -t
```

Run migrations as a single release job before rolling out multiple API
replicas. Do not enable `DATABASE_MIGRATIONS_RUN=true` on every replica.

## Deliberately deferred endpoints

The schema supports membership moderation, but owner/admin endpoints for
approving pending joins, leaving, changing roles, banning, reports, and
soft-deleting content are the next backend increment. Mutation idempotency keys,
refresh-token rotation/revocation, notifications, and a real event consumer
also remain explicit follow-up work; they are not falsely claimed as completed.
