/**
 * Run this ONCE, locally, to log in and generate a session string.
 *
 * Usage:
 *   npm install
 *   npm run login
 *
 * It will ask for your API_ID / API_HASH (or read from .env), then your
 * phone number, the login code Telegram sends you, and your 2FA password
 * if you have one set. At the end it prints a session string — copy that
 * into the SESSION_STRING env var on bunny.net (or your .env locally).
 */

require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // comes bundled with telegram's deps

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;

(async () => {
  console.log("Logging in to generate a session string...");
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Phone number (with country code): "),
    password: async () => await input.text("2FA password (leave blank if none): "),
    phoneCode: async () => await input.text("Login code sent to Telegram: "),
    onError: (err) => console.error(err),
  });

  console.log("\nLogin successful. Your session string is:\n");
  console.log(client.session.save());
  console.log("\nCopy this into SESSION_STRING in your .env / bunny.net env vars.\n");

  await client.disconnect();
  process.exit(0);
})();
