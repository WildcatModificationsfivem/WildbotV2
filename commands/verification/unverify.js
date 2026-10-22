const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../src/config");
const db = require("../../src/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unverify")
    .setDescription("Remove a member's verification")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) return interaction.reply({ content: "❌ User is not in the server.", ephemeral: true });

    await member.roles.remove(config.verifiedRoleId, "D1RP staff unverify");
    await db.removeVerified(user.id);

    await interaction.reply({ content: `✅ Removed verification from **${user.tag}**.` });
  }
};
