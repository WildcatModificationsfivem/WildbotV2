const { Events, MessageFlags } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[COMMAND] /${interaction.commandName}`, error);

        const message = {
          content: `❌ An error occurred: ${error.message}`,
          flags: MessageFlags.Ephemeral
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(message).catch(() => {});
        } else {
          await interaction.reply(message).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const ticketCommand = client.commands.get("ticket");
      if (interaction.customId.startsWith("ticket:open:")) {
        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
        const ticketType = interaction.customId.slice("ticket:open:".length);
        const modal = new ModalBuilder().setCustomId(`ticket:reason:${ticketType}`).setTitle("Open a support ticket");
        const reason = new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("What do you need help with?")
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(500)
          .setRequired(true);
        const rows = [new ActionRowBuilder().addComponents(reason)];
        if (ticketType === "user-report") {
          const reportedUser = new TextInputBuilder()
            .setCustomId("reported-user")
            .setLabel("User ID or mention to report")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(30)
            .setRequired(true);
          rows.push(new ActionRowBuilder().addComponents(reportedUser));
        }
        return interaction.showModal(modal.addComponents(...rows));
      }
      if (ticketCommand?.handleButton) await ticketCommand.handleButton(interaction, client).catch(console.error);
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("ticket:reason:")) {
      const ticketCommand = client.commands.get("ticket");
      if (!ticketCommand?.createTicket) return;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const ticketType = interaction.customId.slice("ticket:reason:".length);
      const reportedUser = ticketType === "user-report" ? interaction.fields.getTextInputValue("reported-user") : null;
      await ticketCommand.createTicket(interaction, interaction.fields.getTextInputValue("reason"), ticketType, reportedUser).catch(async error => {
        console.error("[TICKET] Modal submit", error);
        await interaction.editReply({ content: `❌ An error occurred: ${error.message}` }).catch(() => {});
      });
    }
  }
};
