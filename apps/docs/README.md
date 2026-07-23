# Rspress website

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start the dev server:

```bash
pnpm dev:docs
```

Build the website for production:

```bash
pnpm build:docs
```

Preview the production build locally:

```bash
pnpm --filter search-next-docs preview
```

## Deploy to Cloudflare Workers

The Workers Builds settings for this monorepo are:

```text
Build command: pnpm build:docs
Deploy command: pnpm deploy:docs
Build output directory: apps/docs/doc_build
```

The deploy command uses `apps/docs/wrangler.jsonc` explicitly so Wrangler does
not try to auto-detect an application from the monorepo root.
