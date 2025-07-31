# Troubleshooting

## Common Issues

- **Remote not loading:** Check remote URL and network access.
- **Shared dependency version mismatch:** Align versions in all modules’ `package.json`.
- **Type errors:** Run `pnpm typecheck` and ensure all types are up to date.
- **Hot reload not working:** Restart dev server, check Rsbuild config.

## Debugging Tips

- Use browser dev tools to inspect loaded scripts.
- Check network tab for failed requests.
- Use `console.log` and React DevTools for runtime debugging.

## FAQ

- **How do I add a new remote?** See `docs/development.md`.
- **How do I update shared dependencies?** Update in all modules and rebuild.
