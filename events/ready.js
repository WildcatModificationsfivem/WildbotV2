const { Events } = require("discord.js");

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m"
};

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    const inviteUrl = process.env.DISCORD_INVITE_URL || "https://discord.gg/JEpqAn9D4x";

    console.log(`${colors.cyan}=========================================${colors.reset}`);
    console.log(`${colors.bold}${colors.magenta} District One Roleplay Discord Bot${colors.reset}`);
    console.log(`${colors.green} Logged in as ${client.user.tag}${colors.reset}`);
    console.log(`${colors.yellow} Loaded ${client.commands.size} commands${colors.reset}`);
    console.log(`${colors.cyan} Discord-only verification enabled${colors.reset}`);
    console.log(`${colors.cyan} Discord invite: ${inviteUrl}${colors.reset}`);
    console.log(`${colors.cyan}=========================================${colors.reset}`);
    console.log(`${colors.magenta}Made by Wildcat Modifications${colors.reset}`);
  }
};
