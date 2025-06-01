import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands";
import init, {
  generateChatEmbed,
  generateShoutboxEmbed,
  getChatroomMsgs,
  getGroupShouts,
} from "./request";
import { getCache } from "./cache";

// the Discord client
const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

let interval: NodeJS.Timeout | undefined;

/**
 * Kills the bot.
 */
export async function kill() {
  console.log("Stopping logging...");
  clearInterval(interval);

  console.log("Logging off client...");
  client.destroy();

  console.log("Processes stopped.");
  process.exit(0);
}

/**
 * Log all messages once
 */
async function log() {
  for (const log of getCache()) {
    if (log.type === "chat") {
      const chats = await getChatroomMsgs(log.chatroom);
      for (const chat of chats) {
        await log.channel.send({ embeds: generateChatEmbed(chat) });
      }
    } else {
      const shouts = await getGroupShouts(log.groupID);
      for (const shout of shouts) {
        await log.channel.send({ embeds: generateShoutboxEmbed(shout) });
      }
    }
  }
}

async function run() {
  // initialize session
  await init();

  // Interaction handling
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      // slash commands
      const command = commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("error:", error);
        if (!interaction.replied) {
          if (interaction.deferred) {
            // console.log("error detected, attempting edit...");
            await interaction.editReply(
              "There was an error while executing this command!"
            );
          } else {
            // console.log("error detected, attempting reply...");
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          }
        }
      }
    }
  });

  // Startup finish message
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  client.login(process.env.DISCORD_TOKEN);

  interval = setInterval(log, 10_000);
}

run().catch(console.dir);
