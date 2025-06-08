import { getGroupName } from "../src/request";

(async () => {
  const groupName = await getGroupName(12182);
  console.log(groupName);
})();
