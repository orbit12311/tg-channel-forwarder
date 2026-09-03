# tg-channel-forwarder

Userbot that forwards new messages from a Telegram channel you're a
**member** of (not admin) into a channel you **admin**. Separate project
from `telegram-sub-manager` (LunafluxBot) — same deploy pattern
(Node.js container on bunny.net Magic Containers), own repo, own
container, own credentials.

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `API_ID` / `API_HASH` — from https://my.telegram.org (API development tools)
- `SOURCE_CHANNEL` / `DEST_CHANNEL` — usernames (no `@`) or `-100...` chat IDs
- Leave `SESSION_STRING` blank for now

Join `SOURCE_CHANNEL` with the Telegram account you'll use for this bot
(just needs to be a member — search it and hit Join, or use an invite
link if private). Make sure that same account is an **admin** of
`DEST_CHANNEL`.

## 2. Generate a session string (one time, local machine only)

```bash
npm run login
```

Enter your phone number, the login code Telegram sends, and your 2FA
password if you have one. Copy the printed session string into
`SESSION_STRING` in `.env`.

**Never commit `.env` or share the session string** — it's equivalent
to being logged into your Telegram account.

## 3. Run locally

```bash
npm start
```

## 4. Deploy to bunny.net Magic Containers (same as LunafluxBot)

1. Push this folder as its own repo (separate from `telegram-sub-manager`).
2. Create a **new** Magic Container app pointing at this repo/Dockerfile —
   don't add it to the existing Lunaflux container.
3. Set env vars in the bunny.net dashboard:
   `API_ID`, `API_HASH`, `SESSION_STRING`, `SOURCE_CHANNEL`,
   `DEST_CHANNEL`, `KEEP_FORWARD_TAG`.
4. Deploy. Logs should show `Forwarder connected. Listening on ...`.

## Notes

- `KEEP_FORWARD_TAG=true` keeps the "Forwarded from" attribution;
  `false` re-posts content as a clean copy.
- If the source channel restricts forwarding/saving, forwards may
  silently fail for that content — check logs.
- This is a separate process/container from LunafluxBot and shares no
  code or database with it, by design.
