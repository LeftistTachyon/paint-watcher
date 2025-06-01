import {
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordCommand } from "../type";

const logGroup: DiscordCommand = {
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
            .addChoices([
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
            ])
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "group") {
      const groupID = Number(interaction.options.getInteger("group-id", true));
      await interaction.reply(`Now tracking group #${groupID} in this channel`);
    } else if (subcommand === "chatroom") {
      const chatroom = interaction.options.getString("chatroom", true);
      await interaction.reply(
        `Now tracking chatroom ${chatroom} in this channel`
      );
    } else {
      await interaction.reply({
        content: "How did you even call a subcommand that doesn't exist!?",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default logGroup;
