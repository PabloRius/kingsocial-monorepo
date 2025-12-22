# My Monorepo

This repository contains a **monorepo** with multiple TypeScript projects:

- **Next.js frontend (`apps/web`)**
- **Express backend service (`apps/users-service`)**
- **Shared packages (`packages/shared-types` and `packages/shared-models`)**

All projects share TypeScript types and domain models via workspace packages.

---

## Prerequisites

- Node.js >= 20.x
- pnpm >= 8.x

---

## Initial Setup

From the repository root:

```bash
# Install dependencies for all packages
pnpm install
```

```bash
# Create build for all packages
pnpm build
```

```bash
# Run all packages
pnpm dev
```
