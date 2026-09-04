require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

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

  const sessionString = client.session.save();
  const envPath = path.join(__dirname, ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

  if (/^SESSION_STRING=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^SESSION_STRING=.*$/m, `SESSION_STRING=${sessionString}`);
  } else {
    envContent += `\nSESSION_STRING=${sessionString}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\nLogin successful. Session string saved directly into .env.\n");

  await client.disconnect();
  process.exit(0);
})();
