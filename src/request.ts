import { EmbedBuilder } from "discord.js";
import { parse, walk } from "html5parser";
import { ChatMessage, Shout } from "./type";

let headers: Headers | undefined;

export default async function init() {
  const formdata = new FormData();
  formdata.append("username", process.env.PAINT_USERNAME || "missing-username");
  formdata.append("password", process.env.PAINT_PSWD || "missing-pswd");
  formdata.append("remember", "false");
  // console.log(formdata);

  const resp = await fetch("https://3dspaint.com/", {
    method: "POST",
    body: formdata,
    redirect: "follow",
  });

  const cookies = resp.headers.get("set-cookie");
  // console.log(cookies);
  headers = new Headers();
  headers.append("Cookie", String(cookies));
}

export async function getChatroomMsgs(chatroom: string) {
  const resp = await fetch(
    `https://3dspaint.com/chatroom?ajax=${Number(
      new Date()
    )}&id=${chatroom}&action=read`,
    {
      method: "GET",
      headers,
      redirect: "follow",
    }
  );

  const output = (await resp.json()) as ChatMessage[];
  output.reverse();
  return output;
}

export async function getGroupShouts(groupID: number) {
  const resp = await fetch(
    `https://3dspaint.com/group/shoutbox.php?ajax=${Number(
      new Date()
    )}&action=load&id=${groupID}`,
    {
      method: "GET",
      headers,
      redirect: "follow",
    }
  );

  const output = (await resp.json()) as Shout[];
  output.reverse();
  return output;
}

export function generateChatEmbed(msg: ChatMessage) {
  const parsed = parseMsgString(msg.text, msg.username ? "" : "-# ");

  let firstEmbed = new EmbedBuilder()
    .setAuthor({
      name: msg.username,
    })
    .setColor(`#${convertChatColor(msg.color)}`)
    .setDescription(parsed.text);

  if (parsed.images.length >= 1) {
    firstEmbed = firstEmbed.setImage(parsed.images[0]);

    const allEmbeds = parsed.images
      .slice(1)
      .map((image) => new EmbedBuilder().setImage(image));
    allEmbeds.unshift(firstEmbed);
    return allEmbeds;
  } else return [firstEmbed];
}

function convertChatColor(chatColor: string) {
  return chatColor
    .split("")
    .map(function (s) {
      return s + s;
    })
    .join("");
}

export function generateShoutboxEmbed(shout: Shout) {
  const parsed = parseMsgString(shout.text);

  let firstEmbed = new EmbedBuilder()
    .setAuthor({
      name: shout.name,
      url: `https://3dspaint.com/member/?id=${shout.member}`,
      iconURL: `https://3dspaint.com${shout.avatar}`,
    })
    .setDescription(parsed.text)
    .setTimestamp(shout.date);

  if (parsed.images.length >= 1) {
    firstEmbed = firstEmbed.setImage(parsed.images[0]);

    const allEmbeds = parsed.images
      .slice(1)
      .map((image) => new EmbedBuilder().setImage(image));
    allEmbeds.unshift(firstEmbed);
    return allEmbeds;
  } else return [firstEmbed];
}

function parseMsgString(msgString: string, initialString: string = "") {
  const parsed = parse(msgString);

  let text = "";
  const images: string[] = [];
  walk(parsed, {
    enter(node) {
      if (node.type === "Text") {
        text += node.value.replace(/\s+/, " ");
      } else if (node.type === "Tag") {
        switch (node.name) {
          case "a":
            text += "[";
            break;
          case "img":
            let src = node.attributes.find(
              (attribute) => attribute.name.value === "src"
            )?.value?.value;
            if (src?.startsWith("/")) src = "https://3dspaint.com" + src;
            if (src) images.push(src);
            break;
          case "br":
            text += "\n";
            break;
        }
      }
    },
    leave(node) {
      if (node.type === "Tag" && node.name === "a") {
        let href = node.attributes.find(
          (attribute) => attribute.name.value === "href"
        )?.value?.value;
        if (href?.startsWith("/")) href = "https://3dspaint.com" + href;
        text += `](${href})`;
      }
    },
  });

  return { text, images };
}
