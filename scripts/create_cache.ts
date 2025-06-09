import { writeFile } from "fs/promises";
import { getGroupShouts } from "../src/request";
import groupCache from "./group-cache.json";

(async () => {
  const cacheAsync = groupCache.map(async ({ channelID, groupID }) => {
    const shouts = await getGroupShouts(groupID);
    return {
      type: "shout",
      channelID,
      groupID,
      cached: shouts.map((shout) => shout.id),
    };
  });

  const cache = await Promise.all(cacheAsync);
  await writeFile(
    process.env.CACHE_FILE ?? "cache.json",
    JSON.stringify(cache),
    "utf8"
  );
})();
