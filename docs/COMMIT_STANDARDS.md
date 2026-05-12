# Commit Message Standards

## Format

```
<type>(<scope>): <description>
```

## Types

| Type       | Usage                                      |
|------------|--------------------------------------------|
| `feat`     | New feature                                |
| `fix`      | Bug fix                                    |
| `refactor` | Code restructuring (no functional change)  |
| `style`    | Formatting, styling (no logic change)      |
| `docs`     | Documentation changes                      |
| `chore`    | Dependencies, config, tooling              |
| `perf`     | Performance improvements                   |
| `test`     | Adding or updating tests                   |
| `ci`       | CI/CD pipeline changes                     |

## Examples

```
feat(auth): add Google One Tap login
fix(chat): resolve WebSocket reconnection loop
refactor(api): extract base API client
chore(deps): update next.js to 14.2.35
docs(readme): update setup instructions
style(header): align nav items
```

## Rules

1. Use imperative mood ("add" not "added")
2. First line max 72 characters
3. Scope is optional but recommended
4. No period at end of subject line
5. Use body for breaking changes or complex context
