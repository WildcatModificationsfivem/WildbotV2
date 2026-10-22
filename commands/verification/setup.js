const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Create the YOUR_SERVER_NAME verification panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🔐 YOUR_SERVER_NAME Verification")
      .setDescription(
        "Welcome to **YOUR_SERVER_NAME**!\\n\\n" +
        "Click **✅ Verify** below to verify your Discord account.\\n\\n" +
        "Once verified, you will receive the **Verified** role."
      )
      .setTimestamp()
      .setFooter({ text: "YOUR_SERVER_NAME • Discord Verification" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("YOUR_SERVER_NAME_verify")
        .setLabel("Verify")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "✅ Verification panel created.", ephemeral: true });
  }
};
