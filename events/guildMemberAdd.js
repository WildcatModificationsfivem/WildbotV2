const { Events, EmbedBuilder } = require("discord.js");
const config = require("../src/config");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (!config.welcomeChannelId) return;

    const channel = await member.client.channels
      .fetch(config.welcomeChannelId)
      .catch(() => null);

    if (!channel?.isTextBased()) return;

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("👋 Welcome to District One Roleplay!")
          .setDescription(
            `Welcome ${member}!\\n\\n` +
            "Please use the verification panel to gain access to the verified areas."
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: "District One Roleplay" })
      ]
    }).catch(() => {});
  }
};
