<div align="center">

# BibTeX OSS

<img width="75" src="./frontend/src/favicon.ico">

A one-stop-shop to generate BibTeX from DOI, ISBN and URLs.

[bibtex.ms-ds.org](https://bibtex.ms-ds.org)

</div>

# Setup

## Local

Install:

```bash
npm install
cd frontend
npm install -g @angular/cli
npm install
```

Run backend:

```bash
npm run start
```

Run frontend:

```bash
cd frontend
ng serve --open
```

## Docker Compose

Refer to the following example `compose.yml`:

```yaml
services:
  backend:
    container_name: bibtex-oss_backend
    build: .
    environment:
      NODE_ENV: production

  frontend:
    container_name: bibtex-oss_frontend
    build: frontend
    ports:
      - 80:80
```
