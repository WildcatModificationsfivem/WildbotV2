const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../src/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View Discord user information")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const warnings = await db.getWarnings(user.id);
    const verified = await db.isVerified(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "Discord ID", value: user.id, inline: true },
        { name: "Verified", value: verified ? "✅ Yes" : "❌ No", inline: true },
        { name: "Warnings", value: String(warnings.length), inline: true },
        { name: "Joined Server", value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown" }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
