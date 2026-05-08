import { getGroupName } from "../src/request";

(async () => {
  console.time("test");
  const output = await getGroupName(12182);
  console.timeEnd("test");

  console.log(output);
})();
