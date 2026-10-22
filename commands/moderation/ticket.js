const {
	ChannelType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder
} = require("discord.js");
const config = require("../../src/config");
const database = require("../../src/database");
const { sendLog } = require("../../src/utils");

function respondPrivately(interaction, content) {
	if (interaction.deferred) return interaction.editReply({ content });
	return interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

function ticketName(user) {
	return `ticket-${user.username}`
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-")
		.slice(0, 90);
}

const ticketLabels = {
	support: "General Support",
	"application-support": "Application Support",
	"user-report": "User Report",
	"staff-report": "Staff Report"
};

async function createTicket(interaction, reason, ticketType = "support", reportedUserId = null) {
	if (ticketType === "user-report") {
		reportedUserId = reportedUserId?.match(/\d{17,20}/)?.[0] || null;
		if (!reportedUserId) return respondPrivately(interaction, "❌ Please provide a valid Discord user ID or mention.");
	}
	const existingTicket = await database.getOpenTicketByOwner(interaction.user.id);
	if (existingTicket) {
		const existingChannel = await interaction.guild.channels.fetch(existingTicket.channel_id).catch(() => null);
		if (existingChannel) {
			return respondPrivately(interaction, `❌ You already have an open ticket: ${existingChannel}`);
		}
		await database.closeTicket(Date.now(), interaction.client.user.id, existingTicket.channel_id);
	}

	const supportOverwrites = config.supportRoleIds.map(roleId => ({
		id: roleId,
		allow: [
			PermissionFlagsBits.ViewChannel,
			PermissionFlagsBits.SendMessages,
			PermissionFlagsBits.ReadMessageHistory
		]
	}));
	const ticketChannel = await interaction.guild.channels.create({
		name: `${ticketType}-${ticketName(interaction.user).replace("ticket-", "")}`.slice(0, 90),
		type: ChannelType.GuildText,
		parent: ticketType === "staff-report" ? (config.ticketManagementCategoryId || config.ticketOpenCategoryId || undefined) : (config.ticketOpenCategoryId || undefined),
		topic: `ticket-owner:${interaction.user.id} | ${reason}`,
		permissionOverwrites: [
			{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
			{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
			{ id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] },
			...supportOverwrites
		]
	});

	await database.addTicket(ticketChannel.id, interaction.user.id, reason, ticketType, reportedUserId, Date.now());
	const claimButton = new ButtonBuilder().setCustomId("ticket:claim").setLabel("Claim ticket").setStyle(ButtonStyle.Success);
	const closeButton = new ButtonBuilder()
		.setCustomId("ticket:close")
		.setLabel("Close ticket")
		.setStyle(ButtonStyle.Danger);
	const deleteButton = new ButtonBuilder()
		.setCustomId("ticket:delete")
		.setLabel("Delete ticket")
		.setStyle(ButtonStyle.Danger);
	await ticketChannel.send({
		embeds: [new EmbedBuilder()
			.setColor(ticketType === "staff-report" ? 0xe74c3c : 0x2f80ed)
			.setTitle("👋 Welcome to District One Roleplay Support")
			.setDescription(`Thanks for reaching out, ${interaction.user}! A support team member will be with you shortly. Please be patient and keep all relevant details in this ticket.`)
			.addFields(
				{ name: "Ticket type", value: ticketLabels[ticketType], inline: true },
				{ name: "Reason", value: reason },
				...(reportedUserId ? [{ name: "Reported user", value: `<@${reportedUserId}>`, inline: true }] : [])
			)
			.setFooter({ text: "District One Roleplay • Support" })
		],
		components: [new ActionRowBuilder().addComponents(claimButton, closeButton, deleteButton)]
	});
	await sendLog(interaction.client, "Ticket opened", `${ticketChannel} opened by ${interaction.user}. Type: ${ticketLabels[ticketType]}. Category: ${ticketType === "staff-report" ? "Management" : "Support"}. Reason: ${reason}`);
	return respondPrivately(interaction, `✅ Your ticket has been created: ${ticketChannel}`);
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("ticket")
		.setDescription("Open a private support ticket")
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("What do you need help with?")
				.setRequired(true)
				.setMaxLength(500)
		),

	async execute(interaction) {
		const reason = interaction.options.getString("reason", true);
		await createTicket(interaction, reason);
	},

	createTicket,
	async handleButton(interaction) {
		if (interaction.customId === "ticket:delete") {
			const ticket = await database.getTicketByChannel(interaction.channelId);
			const isSupport = config.supportRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
			if (!isSupport && !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
				return interaction.reply({ content: "❌ Only support team members can delete tickets.", flags: MessageFlags.Ephemeral });
			}
			if (!ticket) return interaction.reply({ content: "❌ This is not a ticket channel.", flags: MessageFlags.Ephemeral });
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			await sendLog(interaction.client, "Ticket deleted", `${interaction.channel} was deleted by ${interaction.user}. Ticket owner: <@${ticket.discord_id}>.`);
			await interaction.channel.delete("Ticket deleted");
			return interaction.editReply("🗑️ Ticket deleted.").catch(() => {});
		}
		if (interaction.customId === "ticket:claim") {
			const ticket = await database.getOpenTicketByChannel(interaction.channelId);
			const isSupport = config.supportRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
			if (!isSupport) return interaction.reply({ content: "❌ Only support team members can claim tickets.", flags: MessageFlags.Ephemeral });
			if (!ticket) return interaction.reply({ content: "❌ This is not an open ticket.", flags: MessageFlags.Ephemeral });
			if (ticket.claimed_by) return interaction.reply({ content: `❌ This ticket is already claimed by <@${ticket.claimed_by}>.`, flags: MessageFlags.Ephemeral });
			await database.claimTicket(interaction.user.id, interaction.channelId);
			await sendLog(interaction.client, "Ticket claimed", `${interaction.channel} was claimed by ${interaction.user}.`);
			return interaction.reply(`🙋 ${interaction.user} has claimed this ticket and will help you shortly.`);
		}
		if (interaction.customId === "ticket:close") {
			const ticket = await database.getOpenTicketByChannel(interaction.channelId);
			if (!ticket) return interaction.reply({ content: "❌ This is not an open ticket.", flags: MessageFlags.Ephemeral });
			const isSupport = config.supportRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
			if (ticket.discord_id !== interaction.user.id && !isSupport && !interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
				return interaction.reply({ content: "❌ Only the ticket owner or support team can close this ticket.", flags: MessageFlags.Ephemeral });
			}
			await database.closeTicket(Date.now(), interaction.user.id, interaction.channelId);
			await interaction.channel.permissionOverwrites.edit(ticket.discord_id, {
				ViewChannel: false,
				SendMessages: false,
				ReadMessageHistory: false
			}).catch(() => {});
			if (config.ticketClosedCategoryId) {
				await interaction.channel.setParent(config.ticketClosedCategoryId, { lockPermissions: false });
			}
			await sendLog(interaction.client, "Ticket closed", `${interaction.channel} closed by ${interaction.user} and moved to the closed-ticket category.`);
			await interaction.reply("🔒 Ticket closed and moved to the closed-ticket category.");
		}
	}
};
