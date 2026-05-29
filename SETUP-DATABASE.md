# Database setup (required for login & API data)

PlacePro needs **PostgreSQL**. Docker is not installed on your machine, so use one of these options:

## Option A — Docker Desktop (recommended)

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. From the `placepro-ai` folder:

```powershell
docker compose up postgres redis -d
npm run db:push
npm run db:seed
```

## Option B — PostgreSQL on Windows

```powershell
winget install PostgreSQL.PostgreSQL.16
```

During setup, set password to `placepro` and port `5432`. Then create the database:

```sql
CREATE USER placepro WITH PASSWORD 'placepro';
CREATE DATABASE placepro OWNER placepro;
```

```powershell
npm run db:push
npm run db:seed
```

## Option C — Free cloud database (no local install)

1. Create a free project at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
2. Copy the connection string into `placepro-ai/.env`:

```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

3. Run:

```powershell
npm run db:push
npm run db:seed
```

## Demo accounts (after seed)

| Email | Password |
|-------|----------|
| student@placepro.ai | password123 |
| admin@placepro.ai | password123 |
