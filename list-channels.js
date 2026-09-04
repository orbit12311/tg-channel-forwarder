require("dotenv").config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const sessionString = process.env.SESSION_STRING;

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  await client.connect();
  console.log("Connected. Fetching your chats...");
  const dialogs = await client.getDialogs({ limit: 200 });
  for (const dialog of dialogs) {
    if (dialog.isChannel || dialog.isGroup) {
      console.log(dialog.title + " | ID: " + dialog.id);
    }
  }
  await client.disconnect();
  process.exit(0);
})();
