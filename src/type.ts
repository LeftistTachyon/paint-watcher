// ! ================== DISCORD TYPES =================== !

import type {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Something that represents a slash command
 */
export type DiscordCommand = {
  data: SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
  autocomplete?: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void>;
};
