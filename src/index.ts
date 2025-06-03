import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands";
import init, {
  generateChatEmbed,
  generateShoutboxEmbed,
  getChatroomMsgs,
  getGroupShouts,
} from "./request";
import { getCache, updateShoutCache } from "./cache";
import { backOff, type BackoffOptions } from "exponential-backoff";

// the Discord client
const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

let interval: NodeJS.Timeout | undefined;

const backoffOptions: BackoffOptions = {};

/**
 * Kills the bot.
 */
export async function kill() {
  process.stdout.write("Stopping logging... ");
  clearTimeout(interval);
  process.stdout.write("done.\n");

  process.stdout.write("Logging off client... ");
  client.destroy();
  process.stdout.write("done.\n");

  process.stdout.write("Processes stopped.\n");
  process.exit(0);
}

/**
 * Log all messages once
 */
async function log() {
  for (const log of getCache()) {
    try {
      if (log.type === "chat") {
        process.stdout.write(`Logging ${log.chatroom}... `);
        const chats = await backOff(
          async () => await getChatroomMsgs(log.chatroom),
          backoffOptions
        );
        for (const chat of chats) {
          await log.channel.send({ embeds: generateChatEmbed(chat) });
        }
        process.stdout.write("done.\n");
      } else {
        process.stdout.write(`Logging group #${log.groupID}... `);
        const shouts = await backOff(
          async () => getGroupShouts(log.groupID),
          backoffOptions
        );
        for (const shout of updateShoutCache(log, shouts)) {
          await log.channel.send({ embeds: generateShoutboxEmbed(shout) });
        }
        process.stdout.write("done.\n");
      }
    } catch (error) {
      const e = error as Partial<Error>;

      process.stderr.write("An error was encountered!\n");
      process.stderr.write(String(e.message));

      await log.channel
        .send(`An error has occurred! Please tell <@518196574052941857>.
Logs:
\`\`\`
${e?.stack}
\`\`\``);
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
            // process.stdout.write("error detected, attempting edit...\n");
            await interaction.editReply(
              "There was an error while executing this command!"
            );
          } else {
            // process.stdout.write("error detected, attempting reply...\n");
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
    process.stdout.write(`Ready! Logged in as ${readyClient.user.tag}\n`);
  });

  client.login(process.env.DISCORD_TOKEN);

  async function logWithDelay() {
    await log();
    interval = setTimeout(logWithDelay, 10_000);
  }

  logWithDelay();
}

run().catch(process.stderr.write);
