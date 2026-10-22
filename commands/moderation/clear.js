const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName("amount").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true)),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount", true);
    const deleted = await interaction.channel.bulkDelete(amount, true);

    await interaction.reply({ content: `🧹 Deleted **${deleted.size}** messages.`, ephemeral: true });
  }
};
