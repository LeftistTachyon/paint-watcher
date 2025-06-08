import { loadCache } from "../src/cache";

(async () => {
  const output = await loadCache();
  console.log(output);
})();
