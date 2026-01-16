import { mkdir, writeFile } from "fs/promises";
import { getGroupName, getGroupShouts } from "../src/request";
import { tqdm } from "node-console-progress-bar-tqdm";
import { existsSync } from "fs";

type GroupData = {
  groupID: number;
  groupName: string;
  lastDate: number;
  lastDateString: string;
  avgDate: number;
  avgDateString: string;
};

const arrayRange = (start: number, stop: number, step: number) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_value, index) => start + index * step
  );

(async () => {
  console.log("starting scan...");
  if (!existsSync("data/saves")) await mkdir("data/saves");

  const groupList: GroupData[] = [];
  for (const groupID of tqdm(arrayRange(13812, 12182, -1), {
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

    const lastDate = test[test.length - 1].date,
      avgDate =
        test.map((shout) => shout.date).reduce((prev, curr) => prev + curr) /
        test.length;
    // console.log(new Date(last.date).toLocaleString());

    groupList.push({
      groupID,
      groupName: await getGroupName(groupID),
      lastDate,
      lastDateString: new Date(lastDate).toLocaleString(),
      avgDate,
      avgDateString: new Date(avgDate).toLocaleString(),
    });
  }

  groupList.sort((a, b) => b.avgDate - a.avgDate);
  console.log(
    groupList.slice(0, 20).map((group) =>
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
