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
		.setName("staffpanel")
		.setDescription("Post the support ticket panel")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle("YOUR_SERVER_NAME Support")
			.setDescription("We are happy to help. Choose the option that best matches what you need, and a support team member will be with you soon. Please do not ping management staff")
			.setColor(0x2f80ed)
			.setFooter({ text: "YOUR_SERVER_NAME • Support" });
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("ticket:open:staff-report")
				.setLabel("Report a Staff Member")
				.setStyle(ButtonStyle.Danger), 
			new ButtonBuilder()
				.setCustomId("ticket:open:support")
				.setLabel("Report a Bug")
				.setStyle(ButtonStyle.Success), 
			new ButtonBuilder()
				.setCustomId("ticket:open:user-report")
				.setLabel("Report a Discord User") 
				.setStyle(ButtonStyle.Danger)
		);

		await interaction.channel.send({ embeds: [embed], components: [row] });
		await sendLog(interaction.client, "Ticket panel posted", `${interaction.user} posted a ticket panel in ${interaction.channel}.`);
		await interaction.reply({ content: "✅ Ticket panel posted.", flags: MessageFlags.Ephemeral });
	}
};