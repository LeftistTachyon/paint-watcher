import { Collection } from "discord.js";
import { DiscordCommand } from "../type";
import dumpCache from "./dumpCache";
import log from "./log";
import ping from "./ping";
import send from "./send";
import unlog from "./unlog";

// ! Add any new commands into this list!
export const commandList: DiscordCommand[] = [
  ping,
  log,
  unlog,
  dumpCache,
  send,
];

// Creating collection of commands
const output = new Collection<string, DiscordCommand>();
for (const command of commandList) {
  output.set(command.data.name, command);
}

export default output;
