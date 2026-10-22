const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Post a District One Roleplay announcement")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o.setName("message").setDescription("Announcement").setRequired(true)),

  async execute(interaction) {
    const message = interaction.options.getString("message", true);

    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("📢 YOUR_SERVER_NAME Announcement")
          .setDescription(message)
          .setTimestamp()
          .setFooter({ text: `Posted by ${interaction.user.tag}` })
      ]
    });

    await interaction.reply({ content: "✅ Announcement posted.", ephemeral: true });
  }
};
