const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../../src/database");
const { sendLog } = require("../../src/utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a Discord member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    await db.addWarning(user.id, interaction.user.id, reason, Date.now());
    await sendLog(client, "⚠️ Warning Issued", `**User:** <@${user.id}>\\n**Moderator:** ${interaction.user}\\n**Reason:** ${reason}`);

    await interaction.reply({ content: `⚠️ **${user.tag}** has been warned.\\n**Reason:** ${reason}` });
  }
};
