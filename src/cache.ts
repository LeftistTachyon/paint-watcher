import { SendableChannels, TextBasedChannel } from "discord.js";
import { Shout } from "./type";

type ChatLog = {
  type: "chat";
  channel: SendableChannels;
  chatroom: string;
};
type ShoutLog = {
  type: "shout";
  channel: SendableChannels;
  groupID: number;
  cached: number[];
};

const cache: (ChatLog | ShoutLog)[] = [];

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
 * @param channel the channel to send logging messages to
 * @returns whether the operation was successful
 */
export function addChatLog(chatroom: string, channel: SendableChannels) {
  if (
    cache.findIndex(
      (log) =>
        log.type === "chat" &&
        log.chatroom === chatroom &&
        log.channel.id === channel.id
    ) >= 0
  ) {
    return false;
  }

  cache.push({ type: "chat", channel, chatroom });
  return true;
}

/**
 * Removes a chat log from the cache
 * @param chatroom the chatroom to stop monitoring
 * @param channel the channel to stop sending messages to
 * @returns whether the operation was successful
 */
export function removeChatLog(chatroom: string, channel: TextBasedChannel) {
  const index = cache.findIndex(
    (log) =>
      log.type === "chat" &&
      log.chatroom === chatroom &&
      log.channel.id === channel.id
  );

  if (index >= 0) {
    cache.splice(index, 1);
    return true;
  } else return false;
}

/**
 * Adds a shout log to the cache
 * @param groupID the ID of the group to start monitoring
 * @param channel the channel to send logging messages to
 * @returns whether the operation was successful
 */
export function addShoutLog(groupID: number, channel: SendableChannels) {
  if (
    cache.findIndex(
      (log) =>
        log.type === "shout" &&
        log.groupID === groupID &&
        log.channel.id === channel.id
    ) >= 0
  ) {
    return false;
  }

  cache.push({ type: "shout", channel, groupID, cached: [] });
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
 * @param channel the channel to stop sending logging messages to
 * @returns whether the operation was successful
 */
export function removeShoutLog(groupID: number, channel: TextBasedChannel) {
  const index = cache.findIndex(
    (log) =>
      log.type === "shout" &&
      log.groupID === groupID &&
      log.channel.id === channel.id
  );

  if (index >= 0) {
    cache.splice(index, 1);
    return true;
  } else return false;
}
