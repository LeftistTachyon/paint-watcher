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
];
