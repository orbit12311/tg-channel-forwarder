require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Logger } = require("telegram/extensions");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const client = new TelegramClient(new StringSession(process.env.SESSION_STRING), apiId, apiHash, {
  connectionRetries: 3,
  baseLogger: new Logger("none"),
});

const timeout = setTimeout(() => {
  console.log("TIMED OUT waiting for getMessages.");
  process.exit(1);
}, 20000);

(async () => {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected. Calling getMessages...");
    const messages = await client.getMessages(process.env.SOURCE_CHANNEL, { limit: 1 });
    clearTimeout(timeout);
    console.log("Got " + messages.length + " message(s).");
    if (messages.length > 0) {
      console.log("Forwarding message ID " + messages[0].id + "...");
      await client.forwardMessages(process.env.DEST_CHANNEL, {
        messages: [messages[0].id],
        fromPeer: process.env.SOURCE_CHANNEL,
      });
      console.log("Forwarded successfully.");
    }
  } catch (err) {
    clearTimeout(timeout);
    console.log("ERROR: " + err.message);
  }
  await client.disconnect();
  process.exit(0);
})();
