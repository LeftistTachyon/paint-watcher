import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { DiscordCommand } from "../type";
import { removeChatLog, removeShoutLog } from "../cache";
import { allChatrooms } from "./log";

const unlog: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("unlog")
    .setDescription("Stops logging operation in this channel")
    .addSubcommand((builder) =>
      builder
        .setName("group")
        .setDescription("Stops logging of a group's shouts in this channel")
        .addIntegerOption((option) =>
          option
            .setName("group-id")
            .setDescription(
              "The last number in the URL of the group to unlog shouts from"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((builder) =>
      builder
        .setName("chatroom")
        .setDescription("Stops logging of a chatroom's chats in this channel")
        .addStringOption((option) =>
          option
            .setName("chatroom")
            .setDescription("The name of the chatroom to unlog")
            .addChoices(allChatrooms)
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "group") {
      if (interaction.channel?.isSendable()) {
        const groupID = Number(
          interaction.options.getInteger("group-id", true)
        );

        await interaction.reply(
          removeShoutLog(groupID, interaction.channel)
            ? `No longer logging group #${groupID} in this channel.`
            : `Unable to unlog group #${groupID} in this channel. (Is it not logged?)`
        );
      } else await interaction.reply("This is not a valid channel.");
    } else if (subcommand === "chatroom") {
      if (interaction.channel?.isSendable()) {
        const chatroom = interaction.options.getString("chatroom", true);

        await interaction.reply(
          removeChatLog(chatroom, interaction.channel)
            ? `No longer logging chatroom ${chatroom} in this channel.`
            : `Unable to unlog chatroom ${chatroom} in this channel. (Is it not logged?)`
        );
      } else await interaction.reply("This is not a valid channel.");
    } else {
      await interaction.reply({
        content: "How did you even call a subcommand that doesn't exist!?",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default unlog;
