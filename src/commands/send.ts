import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { DiscordCommand } from "../type";
import { findFromChannel } from "../cache";
import { sendChatroomMsg, sendShoutboxMsg } from "../request";

const send: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Sends a message as the bot.")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message contents to send")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("chatroom")
        .setDescription("The chatroom to send to")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("group-id")
        .setDescription("The last number in the URL of the group to send to")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id === process.env.OWNER_ID) {
      // ok
      const message = interaction.options.getString("message", true),
        groupID = interaction.options.getInteger("group-id", false),
        chatroom = interaction.options.getString("chatroom", false),
        log = interaction.channel
          ? findFromChannel(interaction.channel.id)
          : undefined;
      console.log("send data:", message, groupID, chatroom, log);

      if (groupID) {
        // has group ID
        if (chatroom) {
          // overdefined!
          await interaction.reply({
            content: "Cannot define both group and chatroom.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        await sendShoutboxMsg(groupID, message);
      } else if (chatroom) {
        // no group ID
        // has chatroom
        await sendChatroomMsg(chatroom, message);
      } else if (log) {
        // nothing
        // attempt to scrape from channel ID
        if (log.type === "shout") {
          await sendShoutboxMsg(log.groupID, message);
        } else {
          await sendChatroomMsg(log.chatroom, message);
        }
      } else {
        // not even channel ID
        await interaction.reply({
          content: "Cannot define both group and chatroom.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.reply({
        content: "Sent!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      // reject
      await interaction.reply({
        content: "You can't use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default send;
