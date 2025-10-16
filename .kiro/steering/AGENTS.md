# Agent Instructions

## Package Manager

**Always use `pnpm` for all package management operations.**

When running any package management commands, use `pnpm` instead of `npm` or `yarn`:

- Use `pnpm install` instead of `npm install`
- Use `pnpm build` instead of `npm run build`
- Use `pnpm dev` instead of `npm run dev`
- Use `pnpm test` instead of `npm test`
- Use `pnpm typecheck` instead of `npm run typecheck`
- Use `pnpm lint` instead of `npm run lint`

This project uses pnpm as the package manager for faster installs and better dependency management.

## Available Scripts

Common pnpm scripts available in this project:

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests (if configured)
