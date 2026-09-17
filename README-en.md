# Nexa Mail

<p align="center">
  <img src="mail-vue/public/mail-pwa-512.png" width="80" height="80" alt="Nexa Mail">
</p>

[简体中文](README.md) | English

Nexa Mail is a self-hosted email service customized from the MIT-licensed Cloud Mail project. It is a branding and downstream development effort, not an underlying implementation written from scratch. The original license and copyright notice are retained.

This repository maintains deployment code. The intended public offering is the deployed mail service; this document does not change repository visibility, deploy resources, or delete anything.

## Components

- `mail-vue/`: Vue 3 / Element Plus frontend, login, administration and PWA.
- `mail-worker/`: Cloudflare Workers backend using D1, KV and R2, with existing mail delivery, Resend, Telegram notifications and OAuth integrations.
- `.github/workflows/deploy-cloudflare.yml`: the existing build and deployment workflow.
- `LICENSE`: the preserved MIT license and upstream copyright notice.

## Phase-one branding

- Page title, description, and new-installation website / notice titles use Nexa Mail.
- The favicon, PWA icons (192 / 512 pixels), loading screen, login and sidebar use the owner's blue N mail logo, resized without redesigning it.
- Upstream promotion, donation and documentation links, and the upstream release-check request, are removed from the UI. GitHub OAuth and Telegram notification settings remain.
- Mail business logic, API paths, database structure, Cloudflare bindings and OAuth flows are unchanged.

## Existing installations

New databases receive the new default brand. Existing titles are not migrated or overwritten: when reading settings, the frontend displays `Nexa Mail` only for `title` and `noticeTitle` values exactly equal to the legacy default `Cloud Mail`. Custom titles, notice content and other settings are preserved, without writing back to D1 or KV on reads.

Review any manually customized titles, notice bodies or background images for old branding or links in system settings. User-provided content is not bulk-rewritten. Existing browser / installed PWA icons may require a cache refresh or reinstallation.

## Development and validation

Use Node.js 24 and pnpm 11, matching the existing deployment workflow:

```sh
pnpm --dir mail-vue install --frozen-lockfile
node --test mail-vue/tests/branding.test.js
pnpm --dir mail-vue run build
```

Release builds output to `mail-worker/dist`. Use `pnpm --dir mail-vue run dev` with the existing Worker development configuration for local development.

Notes:

- The remote API URL in `mail-vue/.env.remote` is intentionally unchanged. Do not use remote mode for production builds or send personal mail / real credentials to the upstream development endpoint.
- Keep `name = "cloud-mail"` in `wrangler.toml`, other Wrangler resource names, database names, workflow resource identifiers and bindings to avoid creating replacement resources.
- The legacy OAuth User-Agent is an internal protocol identifier and remains unchanged.
- The `mail-worker` script named `test` actually deploys with Wrangler; it is not a unit-test command.
- Merging into `main` may trigger the existing deployment workflow. Verify deployment configuration before merging; opening a PR does not deploy.
- Never commit access tokens, OAuth client secrets, mail content or production credentials.

## Provenance and license

This customization is based on Cloud Mail. The original copyright notice is `Copyright (c) 2025 aslost`. The root [LICENSE](LICENSE) is unchanged, and third-party licenses and notices are retained.
