/**
 * Telegram Channel Forwarder (userbot)
 * -------------------------------------
 * Listens for new messages in SOURCE_CHANNEL (a channel this account is
 * only a member of) and forwards them into DEST_CHANNEL (a channel this
 * account admins). Runs as its own long-lived process, separate from
 * LunafluxBot.
 */

require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const sessionString = process.env.SESSION_STRING;

const sourceChannel = process.env.SOURCE_CHANNEL; // username or -100... id
const destChannel = process.env.DEST_CHANNEL;
const keepForwardTag = (process.env.KEEP_FORWARD_TAG || "true").toLowerCase() === "true";

if (!apiId || !apiHash || !sessionString) {
  console.error("Missing API_ID, API_HASH, or SESSION_STRING env vars. Run `npm run login` first.");
  process.exit(1);
}
if (!sourceChannel || !destChannel) {
  console.error("Missing SOURCE_CHANNEL or DEST_CHANNEL env vars.");
  process.exit(1);
}

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});

async function main() {
  await client.connect();
  console.log("Forwarder connected. Listening on", sourceChannel, "->", destChannel);

  client.addEventHandler(async (event) => {
    const message = event.message;
    try {
      if (keepForwardTag) {
        await client.forwardMessages(destChannel, {
          messages: [message.id],
          fromPeer: sourceChannel,
        });
      } else {
        await client.sendMessage(destChannel, {
          message: message.message || "",
          file: message.media || undefined,
        });
      }
      console.log(`Forwarded message ${message.id}`);
    } catch (err) {
      console.error(`Failed to forward message ${message.id}:`, err.message);
    }
  }, new NewMessage({ chats: [sourceChannel] }));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

// Keep the process alive
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await client.disconnect();
  process.exit(0);
});
