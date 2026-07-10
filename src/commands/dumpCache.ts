import {
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { DiscordCommand } from "../type";

const dumpCache: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("dump-cache")
    .setDescription(
      "Exports the current cache as a JSON and DMs it to the owner",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id === process.env.OWNER_ID) {
      // ok
      const owner = await interaction.client.users.fetch(process.env.OWNER_ID);

      await owner.send({
        content: "Current cache:",
        files: [
          {
            attachment: "./cache.json",
            name: "cache.json",
            description: "This bot's tracking cache",
          },
        ],
      });

      await interaction.reply({ content: "Sent!" });
    } else {
      // reject
      await interaction.reply({
        content: "You can't use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
export default dumpCache;
