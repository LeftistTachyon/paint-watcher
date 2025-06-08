import { EmbedBuilder } from "discord.js";
import { parse, walk } from "html5parser";
import type { ChatMessage, Shout } from "./type";
import { decode } from "he";

let headers: Headers | undefined;

/**
 * Inititializes the session (logs in)
 */
export default async function init() {
  const formdata = new FormData();
  formdata.append("username", process.env.PAINT_USERNAME || "missing-username");
  formdata.append("password", process.env.PAINT_PSWD || "missing-pswd");
  formdata.append("remember", "false");
  // process.stdout.write(formdata);

  const resp = await fetch("https://3dspaint.com/", {
    method: "POST",
    body: formdata,
    redirect: "follow",
  });

  const cookies = resp.headers.get("set-cookie");
  // process.stdout.write(cookies);
  headers = new Headers();
  headers.append("Cookie", String(cookies));
}

/**
 * Fetches the most recent NEW messages in a chatroom
 * @param chatroom the chatroom to fetch the messages for
 * @returns the most recent new messages to the chatroom
 */
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

  return (await resp.json()) as ChatMessage[];
}

/**
 * Fetches all visible group shouts in the given group's shoutbox
 * @param groupID the ID of the group to fetch the shouts for
 * @returns all visible group shouts to the chatroom
 */
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

  // if the group no longer exists, do not attempt to convert the shouts
  if (resp.redirected) return [];

  const output = (await resp.json()) as Shout[];
  return output.reverse();
}

/**
 * Fix any weird image urls
 * @param imageURL the image URL to fix
 * @returns a non-relative image link to the chatrooms
 */
function correctImage(imageURL: string) {
  return imageURL.startsWith("http")
    ? imageURL
    : "https://3dspaint.com/chatroom/" + imageURL;
}

/**
 * Creates an embed for the given chat message
 * @param msg the chat message to create an embed for
 * @returns an embed for the given chat message
 */
export function generateChatEmbed(msg: ChatMessage) {
  const parsed = parseMsgString(msg.text, msg.username ? "" : "-# ");

  let firstEmbed = new EmbedBuilder()
    .setColor(`#${convertChatColor(msg.color)}`)
    .setDescription(parsed.text || "`<no messsage body>`");
  if (msg.username)
    firstEmbed = firstEmbed.setAuthor({
      name: msg.username,
    });

  if (parsed.images.length >= 1) {
    firstEmbed = firstEmbed
      .setURL("https://3dspaint.com/menu_chatrooms.php")
      .setImage(correctImage(parsed.images[0]));

    const allEmbeds = parsed.images
      .slice(1)
      .map((image) =>
        new EmbedBuilder()
          .setURL("https://3dspaint.com/menu_chatrooms.php")
          .setImage(correctImage(image))
      );
    allEmbeds.unshift(firstEmbed);
    return allEmbeds;
  } else return [firstEmbed];
}

/**
 * Converts a 3 letter hex string to a 6 letter one (e.g. 00f turns into 0000ff)
 * @param chatColor the three-hex string to convert to a six-hex string
 * @returns a proper hex string
 */
function convertChatColor(chatColor: string) {
  return chatColor
    .split("")
    .map(function (s) {
      return s + s;
    })
    .join("");
}

/**
 * Converts the given shoutbox message into a Discord embed
 * @param shout the shout to convert into an embed
 * @returns an embed that contains info from the given shout
 */
export function generateShoutboxEmbed(shout: Shout) {
  const parsed = parseMsgString(shout.text);

  let firstEmbed = new EmbedBuilder()
    .setAuthor({
      name: shout.name,
      url: `https://3dspaint.com/member/?id=${shout.member}`,
      iconURL: `https://3dspaint.com${shout.avatar}`,
    })
    .setDescription(parsed.text || "`<no messsage body>`")
    .setTimestamp(shout.date);

  if (parsed.images.length >= 1) {
    firstEmbed = firstEmbed
      .setURL(`https://3dspaint.com/member/?id=${shout.member}`)
      .setImage(parsed.images[0]);

    const allEmbeds = parsed.images
      .slice(1)
      .map((image) =>
        new EmbedBuilder()
          .setURL(`https://3dspaint.com/member/?id=${shout.member}`)
          .setImage(image)
      );
    allEmbeds.unshift(firstEmbed);
    return allEmbeds;
  } else return [firstEmbed];
}

const emotes: Record<string, string> = {
  "/chatroom/smilies/alien1.gif": "<:alien1:1378842021573296188>",
  "/chatroom/smilies/alien10.gif": "<:alien10:1378842032792932362>",
  "/chatroom/smilies/alien11.gif": "<:alien11:1378842343091863552>",
  "/chatroom/smilies/alien12.gif": "<:alien12:1378842036290982029>",
  "/chatroom/smilies/alien13.gif": "<:alien13:1378842344366936114>",
  "/chatroom/smilies/alien14.gif": "<:alien14:1378842039449419916>",
  "/chatroom/smilies/alien15.gif": "<:alien15:1378842345625223178>",
  "/chatroom/smilies/alien16.gif": "<:alien16:1378842042976698449>",
  "/chatroom/smilies/alien17.gif": "<:alien17:1378842347051286649>",
  "/chatroom/smilies/alien18.gif": "<:alien18:1378842046986457250>",
  "/chatroom/smilies/alien19.gif": "<:alien19:1378842347781226598>",
  "/chatroom/smilies/alien2.gif": "<:alien2:1378842022919803081>",
  "/chatroom/smilies/alien3.gif": "<:alien3:1378842023985156188>",
  "/chatroom/smilies/alien4.gif": "<:alien4:1378842025335590963>",
  "/chatroom/smilies/alien5.gif": "<:alien5:1378842026551803975>",
  "/chatroom/smilies/alien6.gif": "<:alien6:1378842027264966800>",
  "/chatroom/smilies/alien7.gif": "<:alien7:1378842028636635176>",
  "/chatroom/smilies/alien8.gif": "<:alien8:1378842029995458610>",
  "/chatroom/smilies/alien9.gif": "<:alien9:1378842341833703618>",
  "/chatroom/smilies/angellicdevil.gif": "<:angellicdevil:1378842050115666112>",
  "/chatroom/smilies/asleep.gif": "<:asleep:1378842349194444811>",
  "/chatroom/smilies/blacula.gif": "<:blacula:1378842053450137642>",
  "/chatroom/smilies/censored.gif": "<:censored:1378842350209466378>",
  "/chatroom/smilies/chuck.gif": "<:chuck:1378842057153450116>",
  "/chatroom/smilies/goofy.gif": "<:goofy:1378842388734279772>",
  "/chatroom/smilies/grin2.gif": "<:grin2:1378842060593037436>",
  "/chatroom/smilies/heart.gif": "<:heart:1378842353057398794>",
  "/chatroom/smilies/heston.gif": "<:heston:1378842064711843922>",
  "/chatroom/smilies/heston.png": "<:heston:1378842064711843922>",
  "/chatroom/smilies/mindblown.gif": "<:mindblown:1378842067672764566>",
  "/chatroom/smilies/nerd1.gif": "<:nerd1:1378842071422603295>",
  "/chatroom/smilies/nerd2.gif": "<:nerd2:1378842390261137419>",
  "/chatroom/smilies/redneck.gif": "<:redneck:1378842074945687552>",
  "/chatroom/smilies/smirk.gif": "<:smirk:1378842356182159442>",
};

/**
 * Converts an HTML string into an usable format
 * @param msgString the HTML string to parse
 * @param initialString the string to prepend to the text
 * @returns plaintext and image data contained in the given HTML string
 */
function parseMsgString(msgString: string, initialString: string = "") {
  const parsed = parse(msgString);

  let text = initialString;
  const images: string[] = [];
  walk(parsed, {
    enter(node) {
      if (node.type === "Text") {
        text += decode(node.value.replace(/\s+/, " "));
      } else if (node.type === "Tag") {
        switch (node.name) {
          case "a":
            text += "[";
            break;
          case "img":
            let src = node.attributes.find(
              (attribute) => attribute.name.value === "src"
            )?.value?.value;
            if (!src) break;

            if (emotes[src]) {
              text += emotes[src];
            } else {
              if (src.startsWith("/")) src = "https://3dspaint.com" + src;
              images.push(src);
            }
            break;
          case "br":
            text += "\n";
            break;
        }
      }
    },

    leave(node) {
      if (node.type === "Tag" && node.name === "a") {
        if (text.endsWith("[")) text += "LINK";

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
