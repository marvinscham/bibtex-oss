<div align="center">

# BibTeX OSS

<img width="75" src="./frontend/src/favicon.ico">

A one-stop-shop to generate BibTeX from DOI, ISBN and URLs.

[bibtex.ms-ds.org](https://bibtex.ms-ds.org)

</div>

# Setup

## Docker Compose

If you intend to expose your instance to the internet, it's recommended to put it behind a reverse proxy with SSL support.

### Pre-built image

```yaml
services:
  backend:
    container_name: bibtex-oss_backend
    image: ghcr.io/marvinscham/bibtex-oss_backend:latest
    environment:
      NODE_ENV: production

  frontend:
    container_name: bibtex-oss_frontend
    image: ghcr.io/marvinscham/bibtex-oss_frontend:latest
    ports:
      - 80:80
```

### Local build

```yaml
services:
  backend:
    container_name: bibtex-oss_backend
    build: backend
    environment:
      NODE_ENV: production

  frontend:
    container_name: bibtex-oss_frontend
    build: frontend
    ports:
      - 80:80
```

## Dev/Local

Install:

```bash
cd backend
npm install
cd ../frontend
npm install -g @angular/cli
npm install
```

Run backend:

```bash
cd backend
npm run start
```

Run frontend:

```bash
cd frontend
ng serve --open
```
