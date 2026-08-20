# Anchor PostgreSQL container migration

This runbook migrates the existing production PostgreSQL database into the
`postgres` service in `docker-compose.yml`. After cutover, the backend and
community worker use `postgres:5432`; all writes made through the Anchor APIs
are stored in the persistent `anchor_data` Docker volume.

pgAdmin is an administration UI, not a database server. The existing pgAdmin
container can manage the new `postgres` container after it is attached to the
same Docker network.

## Preconditions

- Restore temporary access to the current hosted database. An inaccessible
  database cannot be exported; temporarily upgrading/resetting its quota or
  obtaining a provider backup is required.
- Ensure the server has enough disk and memory with `df -h`, `free -h`, and
  `docker stats --no-stream`.
- Install PostgreSQL client tools on the machine where `pg_dump` will run.
- Use Neon's direct connection endpoint for `pg_dump`, not the hostname that
  contains `-pooler`. Copy it from Neon's Connect dialog with pooling disabled.
- Set `POSTGRES_IMAGE` to a pgvector image with the same PostgreSQL major
  version as the Neon source.
- Run all commands from the Anchor repository directory on the server.
- Do not remove the old database or its credentials until verification and the
  rollback window are complete.

## 1. Preserve the old connection information

Before changing the server `.env`, save its current values in a secure location
outside the repository. Never commit either file.

Required source values:

```text
OLD_DATABASE_HOST
OLD_DATABASE_PORT
OLD_DATABASE_USER
OLD_DATABASE_PASSWORD
OLD_DATABASE_NAME
OLD_DATABASE_SSL
```

The new container uses the existing `DATABASE_NAME` and `DATABASE_USER` keys,
but `DATABASE_PASSWORD` should be changed to a new strong password.

## 2. Stop production writes

Enter maintenance mode if one exists, then stop every process that can write to
the old database:

```bash
docker compose stop backend community-worker frontend website
```

Do not leave another production or local Anchor backend connected to the old
database during the final dump. Otherwise writes made after the dump will not
appear in the new database.

## 3. Dump the complete hosted database

Use a PostgreSQL client version equal to or newer than the source server. The
command prompts for the password so it is not placed in shell history:

```bash
pg_dump \
  --host="<OLD_DATABASE_HOST>" \
  --port="<OLD_DATABASE_PORT>" \
  --username="<OLD_DATABASE_USER>" \
  --dbname="<OLD_DATABASE_NAME>" \
  --format=custom \
  --no-owner \
  --no-acl \
  --verbose \
  --file="anchor-production.dump"
```

Validate the archive before continuing:

```bash
ls -lh anchor-production.dump
pg_restore --list anchor-production.dump > /tmp/anchor-restore-list.txt
test -s /tmp/anchor-restore-list.txt
```

This full dump is mandatory. The repository has `synchronize: false`, and its
TypeORM migrations do not recreate every historical application table.

## 4. Configure the new database credentials

Set these values in the server `.env`:

```dotenv
DATABASE_NAME=anchor
DATABASE_USER=anchor_app
DATABASE_PASSWORD=<NEW_LONG_RANDOM_PASSWORD>
DATABASE_POOL_MAX=10
DATABASE_POOL_MIN=0
DATABASE_SYNCHRONIZE=false
DATABASE_MIGRATIONS_RUN=false
POSTGRES_IMAGE=pgvector/pgvector:pg15
POSTGRES_MEMORY_LIMIT=1g
POSTGRES_CPU_LIMIT=1.0
```

Size the memory/CPU limits for the server instead of blindly increasing them.
The Compose file supplies `DATABASE_HOST=postgres`, `DATABASE_PORT=5432`, and
`DATABASE_SSL=false` directly to the backend and worker.

## 5. Create the PostgreSQL container

Start only the new database:

```bash
docker compose up -d postgres
docker compose ps postgres
docker compose logs --tail 100 postgres
```

Confirm it is healthy:

```bash
docker compose exec -T postgres sh -c \
  'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

The first initialization creates the `vector`, `pgcrypto`, and `pg_trgm`
extensions. The named volume preserves database files across container
recreation.

## 6. Restore the production dump

Restore through stdin so PostgreSQL does not need a host port:

```bash
docker compose exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --no-owner --no-acl --exit-on-error' \
  < anchor-production.dump
```

If the dump tries to create an extension that already exists, inspect the exact
message. Do not ignore table, type, constraint, or data-copy failures.

## 7. Verify schema and data before starting Anchor

```bash
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\\dt"'

docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "SELECT extname FROM pg_extension ORDER BY extname"'

docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -c "SELECT COUNT(*) AS users FROM users"'
```

Compare important table counts with the old database when possible.

## 8. Start the API and verify database readiness

```bash
docker compose up -d --build backend
docker compose logs --tail 200 backend
curl --fail http://127.0.0.1:3012/health
curl --fail http://127.0.0.1:3012/health/ready
```

Test login and create a harmless test record through the application. Confirm
that it appears in the new database before starting background processing.

## 9. Start the remaining services

```bash
docker compose up -d --build community-worker frontend website
docker compose ps
```

Verify login, profile data, submissions, community posts, application tracking,
and daily tasks. All new API writes now go directly to the PostgreSQL container;
there is no continuing connection or synchronization with the hosted database.

## 10. Connect the existing pgAdmin container

Find the Compose network and pgAdmin container name:

```bash
docker network ls
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Networks}}'
```

The network is normally `<compose-project>_default`. Attach the existing
pgAdmin container if it is not already on that network:

```bash
docker network connect <ANCHOR_COMPOSE_NETWORK> <PGADMIN_CONTAINER>
```

In pgAdmin, register a server with:

```text
Host: postgres
Port: 5432
Maintenance database: value of DATABASE_NAME
Username: value of DATABASE_USER
Password: value of DATABASE_PASSWORD
SSL mode: disable
```

Do not publish PostgreSQL port 5432 or pgAdmin directly to the internet.

## 11. Back up the self-hosted database

The Docker volume is not a backup. Create regular off-server backups. A manual
backup can be made with:

```bash
umask 077
docker compose exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --format=custom --no-owner --no-acl' \
  > "anchor-$(date +%Y%m%d-%H%M%S).dump"
```

Copy backups to storage outside this server, apply retention, and test restores.

## Rollback

Keep `anchor-production.dump`, the old connection settings, and the hosted
database unchanged until the new system is proven stable. If verification
fails, stop Anchor, restore the old environment/Compose configuration, and
restart against the hosted database while it remains accessible.
