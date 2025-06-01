import { Collection } from "discord.js";
import { DiscordCommand } from "../type";
import ping from "./ping";
import log from "./log";
import unlog from "./unlog";

// ! Add any new commands into this list!
export const commandList: DiscordCommand[] = [ping, log, unlog];

// Creating collection of commands
const output = new Collection<string, DiscordCommand>();
for (const command of commandList) {
  output.set(command.data.name, command);
}

export default output;
