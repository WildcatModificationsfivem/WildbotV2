const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../src/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View a member's warnings")
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const warnings = await db.getWarnings(user.id);

    if (!warnings.length) {
      return interaction.reply({ content: `✅ **${user.tag}** has no warnings.` });
    }

    const description = warnings.slice(0, 10).map((w, i) =>
      `**${i + 1}.** ${w.reason} — <@${w.moderator_id}> <t:${Math.floor(w.created_at / 1000)}:R>`
    ).join("\\n");

    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle(`⚠️ Warnings — ${user.tag}`).setDescription(description).setTimestamp()]
    });
  }
};
