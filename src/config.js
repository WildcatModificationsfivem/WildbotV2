module.exports = {
  verifiedRoleId: process.env.VERIFIED_ROLE_ID,
  logChannelId: process.env.LOG_CHANNEL_ID || "",
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || "",
  supportRoleIds: (process.env.SUPPORT_ROLE_IDS || "")
    .split(",")
    .map(roleId => roleId.trim())
    .filter(Boolean),
  ticketOpenCategoryId: process.env.TICKET_OPEN_CATEGORY_ID || "",
  ticketClosedCategoryId: process.env.TICKET_CLOSED_CATEGORY_ID || "",
  ticketManagementCategoryId: process.env.TICKET_MANAGEMENT_CATEGORY_ID || ""
};
