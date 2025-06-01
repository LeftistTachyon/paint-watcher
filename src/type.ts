import type {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

// ! ================== DISCORD TYPES =================== !

/**
 * Something that represents a slash command
 */
export type DiscordCommand = {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (
    interaction: ChatInputCommandInteraction<CacheType>
  ) => Promise<void>;
  autocomplete?: (
    interaction: AutocompleteInteraction<CacheType>
  ) => Promise<void>;
};

// ! =================== PAINT TYPES ==================== !

/**
 * A typical message in the chatrooms
 */
export type ChatMessage = {
  avatar: string;
  color: string;
  username: string;
  id: number;
  recipient: string;
  text: string;
  kick: boolean;
};

/**
 * A typical shout in a group shoutbox
 */
export type Shout = {
  id: number;
  name: string;
  member: number;
  avatar: string;
  date: number;
  text: string;
};
