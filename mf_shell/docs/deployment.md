# Deployment

## Build

```bash
pnpm build
```

## Output

- Production assets are output to `dist/`.

## Deployment Steps

1. Build each module (`pnpm build` in each).
2. Deploy static assets to your hosting provider (e.g., Vercel, Netlify, S3).
3. Ensure remote URLs in `module-federation.config.ts` point to deployed locations.

## Environment Variables

- Use `.env` files for configuration.
- Document required variables in each module.

## CI/CD

- Recommend using GitHub Actions or similar for automated builds and deployments.
