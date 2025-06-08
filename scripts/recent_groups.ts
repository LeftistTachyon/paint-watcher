import { writeFile } from "fs/promises";
import { getGroupShouts } from "../src/request";
import { tqdm } from "node-console-progress-bar-tqdm";

type GroupData = { groupID: number; date: number; dateString: string };

const arrayRange = (start: number, stop: number, step: number) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_value, index) => start + index * step
  );

(async () => {
  console.log("starting scan...");

  const groupList: GroupData[] = [];
  for (const groupID of tqdm(arrayRange(13663, 12182, -1), {
    description: "Scanning groups",
    unit: ["group", "groups"],
    progressColor: "red",
  })) {
    if (groupID % 100 === 0) {
      // console.log(
      //   `Checking group #${groupID} (populated ${groupList.length} groups so far)`
      // );
      await writeFile(
        `data/saves/groups_${groupID}.json`,
        JSON.stringify(groupList, null, 2)
      );
    }

    const test = await getGroupShouts(groupID);
    if (!test.length) continue;

    const lastDate = test[test.length - 1].date;
    // console.log(new Date(last.date).toLocaleString());

    groupList.push({
      groupID,
      date: lastDate,
      dateString: new Date(lastDate).toLocaleString(),
    });
  }

  groupList.sort((a, b) => b.date - a.date);
  console.log(
    groupList
      .slice(0, 10)
      .map((group) =>
        Object.assign(
          {
            url: `https://3dspaint.com/group/shoutbox.php?id=${group.groupID}`,
          },
          group
        )
      )
  );

  console.log("writing to file...");
  await writeFile("data/groups.json", JSON.stringify(groupList, null, 2));
  console.log("done!");
})();
