# School Admission

A school admission app with a .NET 8 API, a React (Vite + TypeScript) client, and a PostgreSQL database. Everything runs with Docker Compose.

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

No need to install .NET, Node.js or PostgreSQL locally.

## Project structure

```
onnorokom-assesment/
├── docker-compose.yml
├── school-admission-backend/     # .NET 8 API
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
│       ├── Api/
│       └── Framework/
└── school-admission-client/      # React + Vite client
    ├── Dockerfile
    ├── .dockerignore
    └── nginx.conf
```

## Run the project

From the project root (the folder containing `docker-compose.yml`):

```bash
docker compose up --build
```

The first build takes a few minutes. To run in the background instead:

```bash
docker compose up --build -d
```

## Access the app

| Service  | URL                              | Notes                                      |
|----------|----------------------------------|--------------------------------------------|
| Client   | http://localhost:3000            | React app served by nginx                  |
| API      | http://localhost:8080            | .NET 8 API                                 |
| Swagger  | http://localhost:8080/swagger    | API documentation and test page            |
| Database | `localhost:5432`                 | PostgreSQL 17                              |

### Database credentials

| Setting  | Value           |
|----------|-----------------|
| Host     | `localhost`     |
| Port     | `5432`          |
| Database | `admission-db`  |
| Username | `onnorokom`     |
| Password | `onnorokom`     |

Inside Docker, the API connects with the host name `db`, not `localhost`.

## Common commands

```bash
# View logs of all services
docker compose logs -f

# View logs of one service
docker compose logs -f api
docker compose logs -f client

# Check running containers and ports
docker compose ps

# Stop everything (keeps database data)
docker compose down

# Stop everything and delete database data
docker compose down -v
```

## Rebuild after changes

| What changed                                  | Command                                      |
|-----------------------------------------------|----------------------------------------------|
| Backend or frontend code                      | `docker compose up --build`                  |
| Only one service                              | `docker compose up --build api` (or `client`)|
| Only `docker-compose.yml` settings            | `docker compose up -d`                       |
| Stale build cache                             | `docker compose build --no-cache`            |
| Start with an empty database                  | `docker compose down -v` then `up --build`   |

The frontend is built into static files at image build time. Any change to React code or to `VITE_API_URL` needs `--build` for the client.

## Configuration

Set in `docker-compose.yml`:

| Setting                          | Where     | Purpose                                         |
|----------------------------------|-----------|-------------------------------------------------|
| `ConnectionStrings__Default`     | `api`     | PostgreSQL connection string used by the API    |
| `ASPNETCORE_ENVIRONMENT`         | `api`     | Set to `Development` to enable Swagger          |
| `VITE_API_URL` (build arg)       | `client`  | API address the browser calls (`http://localhost:8080`) |

Port mappings use the format `HOST:CONTAINER`:

- `3000:80` — browser port 3000 goes to nginx on port 80 inside the container
- `8080:8080` — API
- `5432:5432` — PostgreSQL


## Run without Docker (optional)

**Database:** run PostgreSQL locally or start only the db container: `docker compose up db`

**API:**
```bash
cd school-admission-backend/src/Api
dotnet run
```

**Client:**
```bash
cd school-admission-client
npm install
npm run dev
```