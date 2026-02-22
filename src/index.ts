import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands";
import init, {
  generateChatEmbed,
  generateShoutboxEmbed,
  getChatroomMsgs,
  getGroupName,
  getGroupShouts,
} from "./request";
import {
  getCache,
  loadCache,
  removeChatLog,
  removeShoutLog,
  saveCache,
  updateShoutCache,
} from "./cache";
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
      const channel = await client.channels.fetch(log.channelID);

      if (log.type === "chat") {
        process.stdout.write(`Logging ${log.chatroom}..`);
        const chats = await backOff(async () => {
          process.stdout.write(".");
          return getChatroomMsgs(log.chatroom);
        }, backoffOptions);

        if (channel?.isSendable()) {
          for (const chat of chats) {
            await channel.send({ embeds: generateChatEmbed(chat) });
          }
        } else {
          console.warn(
            `CHANNEL ${log.channelID} IS NO LONGER ACCESSIBLE;\nREMOVING LOG FOR CHATROOM ${log.chatroom}`,
          );
          if (removeChatLog(log.chatroom, log.channelID)) {
            console.warn("Removal successful");
          } else {
            console.warn("Removal unsuccessful");
          }
        }
        process.stdout.write("done.\n");
      } else {
        process.stdout.write(`Logging group #${log.groupID}..`);
        const shouts = await backOff(async () => {
          process.stdout.write(".");
          return getGroupShouts(log.groupID);
        }, backoffOptions);

        if (channel?.isSendable()) {
          for (const shout of updateShoutCache(log, shouts)) {
            await channel.send({ embeds: generateShoutboxEmbed(shout) });
          }
        } else {
          console.warn(
            `CHANNEL ${log.channelID} IS NO LONGER ACCESSIBLE;\nREMOVING LOG FOR GROUP ${log.groupID}`,
          );
          if (removeShoutLog(log.groupID, log.channelID)) {
            console.warn("Removal successful");
          } else {
            console.warn("Removal unsuccessful");
          }
        }
        process.stdout.write("done.\n");
      }
    } catch (error) {
      const e = error as Partial<Error>;

      process.stderr.write("An error was encountered!\n");
      process.stderr.write(String(e.stack));

      const channel = await client.channels.fetch(log.channelID);
      if (channel?.isSendable())
        await channel.send(`An error has occurred! Please tell <@518196574052941857>.
Logs:
\`\`\`
${e?.stack}
\`\`\``);
    }
  }

  await saveCache();
}

async function run() {
  // initialize session & cache
  await init();
  await loadCache();

  // Interaction handling
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      // slash commands
      const command = commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
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
              "There was an error while executing this command!",
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
  client.once(Events.ClientReady, async (readyClient) => {
    process.stdout.write(`Ready! Logged in as ${readyClient.user.tag}\n`);

    if (process.env.OWNER_ID) {
      const owner = await readyClient.users.fetch(process.env.OWNER_ID);

      let cacheString = `Logged in at <t:${Math.floor(new Date().getTime() / 1000)}:F>\n`;
      for (const log of getCache()) {
        cacheString += `<#${log.channelID}> → `;
        cacheString +=
          log.type === "chat"
            ? "Chatroom " + log.chatroom
            : `${await getGroupName(log.groupID)} (group #${log.groupID})`;
        cacheString += "\n";
      }

      // send 850+ characters at a time (trust that each line doesn't exceed 150 characters)
      let start = 0;
      for (
        let end = cacheString.indexOf("\n", 850);
        end !== -1;
        start = end, end = cacheString.indexOf("\n", start + 850)
      ) {
        await owner.send(cacheString.substring(start, end) + ".");
      }
      await owner.send(cacheString.substring(start) + ".");
    }
  });

  client.login(process.env.DISCORD_TOKEN);

  async function logWithDelay() {
    await log();
    interval?.refresh();
  }

  interval = setTimeout(logWithDelay, 10_000);
  interval.unref();
}

run().catch(process.stderr.write);
