require("dotenv").config();
const fs = require("fs");
const path = require("path");
const database = require("./src/database");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadCommands(fullPath);
      continue;
    }

    if (!entry.name.endsWith(".js")) continue;

    const command = require(fullPath);

    if (!command.data || !command.execute) {
      console.warn(`[COMMAND] Skipped ${fullPath}: missing data or execute`);
      continue;
    }

    client.commands.set(command.data.name, command);
    console.log(`[COMMAND] Loaded /${command.data.name}`);
  }
}

loadCommands(path.join(__dirname, "commands"));

const eventDir = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventDir).filter(f => f.endsWith(".js"))) {
  const event = require(path.join(eventDir, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

database.initialize()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(error => {
    console.error("[STARTUP] Failed to initialize MySQL or log in to Discord.", error);
    process.exitCode = 1;
  });
