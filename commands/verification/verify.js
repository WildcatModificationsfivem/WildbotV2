const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../src/config");
const db = require("../../src/database");
const { sendLog } = require("../../src/utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your Discord account"),

  async execute(interaction, client) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const role = await interaction.guild.roles.fetch(config.verifiedRoleId).catch(() => null);

    if (!role) throw new Error("Verified role was not found. Check VERIFIED_ROLE_ID.");
    if (!role.editable) throw new Error("Move the bot's highest role above the Verified role.");

    if (member.roles.cache.has(role.id)) {
      return interaction.reply({ content: "✅ You are already verified.", ephemeral: true });
    }

    await member.roles.add(role, "District One Roleplay Discord verification");
    await db.addVerified(member.id, Date.now());

    await sendLog(client, "✅ Member Verified", `${member} has verified their Discord account.`);

    await interaction.reply({
      content: "✅ **Verification successful!** Welcome to District One Roleplay.",
      ephemeral: true
    });
  }
};
