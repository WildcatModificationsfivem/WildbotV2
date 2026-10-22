const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("View District One Roleplay server information"),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🏙️ District One Roleplay")
          .setDescription("District One Roleplay — Serious FiveM Community")
          .addFields(
            { name: "Discord Members", value: String(interaction.guild.memberCount), inline: true },
            { name: "Verification", value: "🟢 Online", inline: true }
          )
          .setTimestamp()
          .setFooter({ text: "District One Roleplay" })
      ]
    });
  }
};
