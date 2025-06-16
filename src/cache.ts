import type { Snowflake } from "discord.js";
import type { ChatLog, Shout, ShoutLog } from "./type";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";

let cache: (ChatLog | ShoutLog)[] = [];

/**
 * Returns all cached logs
 * @returns all logs
 */
export function getCache() {
  return cache;
}

/**
 * Adds a chat log to the cache
 * @param chatroom the chatroom to begin monitoring
 * @param channelID the channel to send logging messages to
 * @returns whether the operation was successful
 */
export function addChatLog(chatroom: string, channelID: Snowflake) {
  if (
    cache.findIndex(
      (log) =>
        log.type === "chat" &&
        log.chatroom === chatroom &&
        log.channelID === channelID
    ) >= 0
  ) {
    return false;
  }

  cache.push({ type: "chat", channelID, chatroom });
  return true;
}

/**
 * Removes a chat log from the cache
 * @param chatroom the chatroom to stop monitoring
 * @param channelID the channel to stop sending messages to
 * @returns whether the operation was successful
 */
export function removeChatLog(chatroom: string, channelID: Snowflake) {
  const index = cache.findIndex(
    (log) =>
      log.type === "chat" &&
      log.chatroom === chatroom &&
      log.channelID === channelID
  );

  if (index >= 0) {
    cache.splice(index, 1);
    return true;
  } else return false;
}

/**
 * Adds a shout log to the cache
 * @param groupID the ID of the group to start monitoring
 * @param channelID the channel to send logging messages to
 * @returns whether the operation was successful
 */
export function addShoutLog(groupID: number, channelID: Snowflake) {
  if (
    cache.findIndex(
      (log) =>
        log.type === "shout" &&
        log.groupID === groupID &&
        log.channelID === channelID
    ) >= 0
  ) {
    return false;
  }

  cache.push({ type: "shout", channelID, groupID, cached: [] });
  return true;
}

/**
 * Updates the given cached log in place
 * @param log the shout log to update in place
 * @param shouts the most recent fetch of shouts
 * @returns new shouts from the given list
 */
export function updateShoutCache(log: ShoutLog, shouts: Shout[]) {
  if (log.cached.length) {
    if (!shouts.length) return [];

    let start = shouts.length - 1;
    while (log.cached[log.cached.length - 1] < shouts[start].id) start--;

    log.cached = shouts.map((shout) => shout.id);
    return shouts.slice(start + 1);
  } else {
    log.cached = shouts.map((shout) => shout.id);
    return shouts;
  }
}

/**
 * Removes a shout log from the cache
 * @param groupID the ID of the group to stop monitoring
 * @param channelID the channel to stop sending logging messages to
 * @returns whether the operation was successful
 */
export function removeShoutLog(groupID: number, channelID: Snowflake) {
  const index = cache.findIndex(
    (log) =>
      log.type === "shout" &&
      log.groupID === groupID &&
      log.channelID === channelID
  );

  if (index >= 0) {
    cache.splice(index, 1);
    return true;
  } else return false;
}

/**
 * Saves the cache to disk
 * @param location the file location to save the cache to (optional)
 */
export async function saveCache(
  location: string = process.env.CACHE_FILE ?? "cache.json"
) {
  await writeFile(location, JSON.stringify(cache, null, 2), "utf8");
}

/**
 * Loads the cache from disk
 *
 * If the file does not exist, nothing happens.
 * @param location the file location to read the cache from (optional)
 */
export async function loadCache(
  location: string = process.env.CACHE_FILE ?? "cache.json"
) {
  if (!existsSync(location)) return;

  const file = await readFile(location, { encoding: "utf8" });
  cache = JSON.parse(file);
}
