import { TextBasedChannel } from "discord.js";

type ChatLog = {
  type: "chat";
  channel: TextBasedChannel;
  chatroom: string;
};
type ShoutLog = {
  type: "shout";
  channel: TextBasedChannel;
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
export function addChatLog(chatroom: string, channel: TextBasedChannel) {
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
export function addShoutLog(groupID: number, channel: TextBasedChannel) {
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
