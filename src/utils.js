const { EmbedBuilder } = require("discord.js");
const config = require("./config");

async function sendLog(client, title, description) {
  if (!config.logChannelId) return;

  const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: "District One Roleplay" });

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { sendLog };
