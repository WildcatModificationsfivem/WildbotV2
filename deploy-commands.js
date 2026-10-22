require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];

function loadCommands(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) loadCommands(fullPath);
    else if (entry.name.endsWith(".js")) {
      const command = require(fullPath);
      if (command.data) commands.push(command.data.toJSON());
    }
  }
}

loadCommands(path.join(__dirname, "commands"));

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} District One Roleplay commands...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash commands deployed successfully.");
  } catch (error) {
    console.error("❌ Command deployment failed:", error);
    process.exit(1);
  }
})();
