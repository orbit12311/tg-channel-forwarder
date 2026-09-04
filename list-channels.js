/**
 * One-time helper: lists every chat/channel your account is in,
 * along with its ID. Use this to find SOURCE_CHANNEL / DEST_CHANNEL
 * values for private channels that don't have a public @username.
 *
 * Requires SESSION_STRING already set in .env (run `npm run login` first).
 *
 * Usage:
 *   node list-channels.js
 */

require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const sessionString = process.env.SESSION_STRING;

if (!apiId || !apiHash || !sessionString) {
  console.error("Missing API_ID, API_HASH, or SESSION_STRING in .env. Run `npm run login` first.");
  process.exit(1);
}

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.connect();
  console.log("Connected. Fetching your chats...\n");

  const dialogs = await client.getDialogs({ limit: 200 });

  for (const dialog of dialogs) {
    if (dialog.isChannel || dialog.isGroup) {
      console.log(`${dialog.title}`);
      console.log(`  ID: ${dialog.id}`);
      console.log(`  Type: ${dialog.isChannel ? "channel" : "group"}`);
      console.log("");
    }
  }

  console.log("Done. Copy the ID for your source/dest channel into .env (SOURCE_CHANNEL / DEST_CHANNEL).");
  await client.disconnect();
  process.exit(0);
})();
