# Contributing to Flourish

Thanks for your interest in contributing. Flourish is a community project and we welcome thoughtful contributions from anyone who wants to make mutual aid more accessible in London, Ontario (or adapt this for their own community).

---

## Ways to Contribute

- **Bug reports** — open an issue describing what happened and what you expected
- **Feature ideas** — open a discussion or issue before building large features
- **Code contributions** — fork, branch, build, open a pull request
- **Documentation** — help improve the README, moderator guide, or inline docs
- **Design** — suggest improvements to UX or visual style

---

## Local Development Setup

See [README.md](./README.md) for full setup instructions.

Short version:

```bash
git clone https://github.com/explorience/flourish.git
cd flourish
npm install
cp .env.example .env.local
# fill in your Supabase and Brevo keys
npm run dev
```

---

## Code Style

- **TypeScript everywhere** — all new files should be `.ts` or `.tsx`
- **Server components first** — use React Server Components unless interactivity requires client
- **CSS variables** — use the design tokens from `globals.css`, not hardcoded hex values
  - Background: `var(--bg)`, cards: `var(--card)`, text: `var(--ink)`, etc.
- **No rounded corners** — the app uses sharp edges by design
- **Fonts**: display font `var(--font-display)` for labels/headings, serif `var(--font-serif)` for body
- **Supabase access**: use `createClient()` (anon, user-scoped) for normal queries; `createServiceClient()` (service role) for admin API routes only
- **No direct DB access from client** — all mutations go through API routes
- **Linting**: `npm run lint` before submitting

---

## Branching

- `main` — production. Never commit directly.
- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/description-of-bug`
- Docs: `docs/what-youre-documenting`

---

## Pull Requests

1. Fork the repo
2. Create your branch from `main`
3. Make your changes
4. Run `npm run build` to check for TypeScript errors
5. Run `npm run lint`
6. Open a PR with a clear description of what changed and why
7. Link any relevant issues

PRs should be focused — one thing per PR. Large sweeping refactors are hard to review.

---

## Database Changes

If your change requires a schema change:

1. Add the SQL to `SUPABASE_MIGRATION.sql` (or create a new migration file)
2. Document the change in your PR description
3. Make sure RLS policies are considered

We don't run automated migrations — changes are applied manually to the Supabase project.

---

## Commit Messages

Use plain English. No need for conventional commits format, but be descriptive:

```
Good: "Add About page with how-it-works section"
Bad: "update stuff"
```

---

## Code of Conduct

Be kind. This is a community project, not a competition. Critique code, not people. If something doesn't feel right, reach out to a maintainer directly before escalating.

---

## Questions?

Open an issue or use the [feedback form](https://flourish.ourlondon.xyz/feedback) on the site.
