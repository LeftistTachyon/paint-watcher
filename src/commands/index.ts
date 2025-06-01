import { Collection } from "discord.js";
import { DiscordCommand } from "../type";
import ping from "./ping";
import logGroup from "./log";

// ! Add any new commands into this list!
export const commandList: DiscordCommand[] = [ping, logGroup];

// Creating collection of commands
const output = new Collection<string, DiscordCommand>();
for (const command of commandList) {
  output.set(command.data.name, command);
}

export default output;
