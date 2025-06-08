import {
  MessageFlags,
  NewsChannel,
  SlashCommandBuilder,
  TextChannel,
  ThreadManager,
  ThreadOnlyChannel,
} from "discord.js";
import { addChatLog, addShoutLog } from "../cache";
import { DiscordCommand } from "../type";
import { getGroupName } from "../request";

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

export const threadChoices = [
  { name: "Stay in channel", value: "stay" },
  { name: "Start new thread", value: "thread" },
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
        .addStringOption((option) =>
          option
            .setName("thread")
            .setDescription("Choose if a new thread should be started")
            .setChoices(threadChoices)
            .setRequired(false)
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
        .addStringOption((option) =>
          option
            .setName("thread")
            .setDescription("Choose if a new thread should be started")
            .setChoices(threadChoices)
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const newThread = interaction.options.getString("thread", false) ?? "stay";

    if (subcommand === "group") {
      const groupID = Number(interaction.options.getInteger("group-id", true));
      const groupName = await getGroupName(groupID);

      if (newThread === "stay") {
        if (interaction.channel?.isSendable()) {
          await interaction.reply({
            content: addShoutLog(groupID, interaction.channel.id)
              ? `Now logging group ${groupName} (#${groupID}) in this channel.`
              : `Unable to log group ${groupName} (#${groupID}) in this channel. (Is it already being logged?)`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "This is not a valid channel.",
            flags: MessageFlags.Ephemeral,
          });
        }
      } else if (!(interaction.channel as any)?.threads) {
        const threadableChannel = interaction.channel as
          | TextChannel
          | ThreadOnlyChannel
          | NewsChannel;
        const thread = await threadableChannel.threads.create({
          name: groupName,
          message: {
            content: `## Logs for ${groupName} (group #${groupID})`,
          },
        });

        await interaction.reply({
          content: addShoutLog(groupID, thread.id)
            ? `Now logging group ${groupName} (#${groupID}) in <#${thread.id}>.`
            : `Unable to log group ${groupName} (#${groupID}) in <#${thread.id}>. (Is it already being logged?)`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "You cannot create a thread in this channel!",
          flags: MessageFlags.Ephemeral,
        });
      }
    } else if (subcommand === "chatroom") {
      const chatroom = interaction.options.getString("chatroom", true);

      if (newThread === "stay") {
        if (interaction.channel?.isSendable()) {
          await interaction.reply({
            content: addChatLog(chatroom, interaction.channel.id)
              ? `Now logging chatroom ${chatroom} in this channel.`
              : `Unable to log chatroom ${chatroom} in this channel. (Is it already being logged?)`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: "This is not a valid channel.",
            flags: MessageFlags.Ephemeral,
          });
        }
      } else if (!(interaction.channel as any)?.threads) {
        const threadableChannel = interaction.channel as
          | TextChannel
          | ThreadOnlyChannel
          | NewsChannel;
        const thread = await threadableChannel.threads.create({
          name: chatroom,
          message: {
            content: `## Logs for ${chatroom}`,
          },
        });

        await interaction.reply({
          content: addChatLog(chatroom, thread.id)
            ? `Now logging chatroom ${chatroom} in <#${thread.id}>.`
            : `Unable to log chatroom ${chatroom} in <#${thread.id}>. (Is it already being logged?)`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "You cannot create a thread in this channel!",
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      await interaction.reply({
        content: "How did you even call a subcommand that doesn't exist!?",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default log;
