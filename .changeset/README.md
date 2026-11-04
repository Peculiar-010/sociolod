# Changesets

This folder is used by [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## How to add a changeset

```bash
pnpm changeset
```

Follow the prompts to describe your change (patch / minor / major).

## How to release

1. `pnpm changeset` — describe your change
2. `pnpm version` — bump versions and update CHANGELOG.md
3. `git commit -am "chore: release"`
4. `git tag v1.x.x`
5. `git push && git push --tags`
6. GitHub Actions publishes to npm automatically
