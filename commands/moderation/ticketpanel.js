const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder
} = require("discord.js"); 
const { sendLog } = require("../../src/utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticketpanel")
		.setDescription("Post the support ticket panel")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle("YOUR_SERVER_NAME Support")
			.setDescription("We are happy to help. Choose the option that best matches what you need, and a support team member will be with you soon.")
			.setColor(0x2f80ed)
			.setFooter({ text: "YOUR_SERVER_NAME • Support" });
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("ticket:open:support")
				.setLabel("General Support")
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId("ticket:open:application-support")
				.setLabel("Application Support")
				.setStyle(ButtonStyle.Success)
		);

		await interaction.channel.send({ embeds: [embed], components: [row] });
		await sendLog(interaction.client, "Ticket panel posted", `${interaction.user} posted a ticket panel in ${interaction.channel}.`);
		await interaction.reply({ content: "✅ Ticket panel posted.", flags: MessageFlags.Ephemeral });
	}
};