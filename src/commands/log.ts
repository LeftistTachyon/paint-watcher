import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { addChatLog, addShoutLog } from "../cache";
import { DiscordCommand } from "../type";

export const allChatrooms = [
  {
    name: "Luigi",
    value: "Luigi",
  },
  {
    name: "Mario",
    value: "Mario",
  },
  {
    name: "Peach",
    value: "Peach",
  },
  {
    name: "Yoshi",
    value: "Yoshi",
  },
  {
    name: "Event",
    value: "Event",
  },
  {
    name: "Game",
    value: "Game",
  },
  {
    name: "TMJ",
    value: "TMJ",
  },
  {
    name: "Brenda",
    value: "Brenda",
  },
  {
    name: "Hockfin",
    value: "Hockfin",
  },
  {
    name: "Jasper",
    value: "Jasper",
  },
  {
    name: "Minco",
    value: "Minco",
  },
  {
    name: "French",
    value: "French",
  },
  {
    name: "German",
    value: "German",
  },
  {
    name: "Portuguese",
    value: "Portuguese",
  },
  {
    name: "Spanish",
    value: "Spanish",
  },
  {
    name: "Debug",
    value: "Debug",
  },
];

const log: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription(
      "Logs important information from Paint into a Discord channel or thread"
    )
    .addSubcommand((builder) =>
      builder
        .setName("group")
        .setDescription(
          "Logs a group's shoutbox messages into a Discord channel or thread"
        )
        .addIntegerOption((option) =>
          option
            .setName("group-id")
            .setDescription(
              "The last number in the URL of the group to log shouts from"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((builder) =>
      builder
        .setName("chatroom")
        .setDescription(
          "Logs a chatroom's messages into a Discord channel or thread"
        )
        .addStringOption((option) =>
          option
            .setName("chatroom")
            .setDescription("The name of the chatroom to log")
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
          addShoutLog(groupID, interaction.channel.id)
            ? `Now logging group #${groupID} in this channel.`
            : `Unable to log group #${groupID} in this channel. (Is it already being logged?)`
        );
      } else await interaction.reply("This is not a valid channel.");
    } else if (subcommand === "chatroom") {
      if (interaction.channel?.isSendable()) {
        const chatroom = interaction.options.getString("chatroom", true);

        await interaction.reply(
          addChatLog(chatroom, interaction.channel.id)
            ? `Now logging chatroom ${chatroom} in this channel.`
            : `Unable to log chatroom ${chatroom} in this channel. (Is it already being logged?)`
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

export default log;
