require("dotenv").config();
const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Logger } = require("telegram/extensions");

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const sessionString = process.env.SESSION_STRING;

const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
  connectionRetries: 3,
  baseLogger: new Logger("none"),
});

const timeout = setTimeout(() => {
  console.log("TIMED OUT - raw call never returned.");
  process.exit(1);
}, 25000);

(async () => {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected. Calling raw messages.getDialogs...");

    const result = await client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: new Api.InputPeerEmpty(),
        limit: 50,
        hash: BigInt(0),
      })
    );
    clearTimeout(timeout);

    console.log("Got response. Chats count: " + result.chats.length);
    for (const chat of result.chats) {
      console.log((chat.title || "(no title)") + " | ID: " + chat.id + " | className: " + chat.className);
    }
  } catch (err) {
    clearTimeout(timeout);
    console.log("ERROR: " + err.message);
  }
  await client.disconnect();
  process.exit(0);
})();
