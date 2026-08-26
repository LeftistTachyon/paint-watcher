import { EmbedBuilder } from "discord.js";
import { decode } from "he";
import { parse, SyntaxKind, walk } from "html5parser";
import { CookieAgent } from "http-cookie-agent/undici";
import { CookieJar } from "tough-cookie";
import { fetch as fetch2 } from "undici";
import type { ChatMessage, Shout } from "./type";

// the cookie jar to store 3DSPaint cookies in
const jar = new CookieJar();
// the agent that can use the cookies to send user-gated requests
const agent = new CookieAgent({ cookies: { jar } });

// ! COOKIES FUNCTIONS

/**
 * Inititializes the session (logs in)
 */
export default async function init() {
  // login creds
  const username = process.env.PAINT_USERNAME || "fake-username";
  const password = process.env.PAINT_PSWD || "fake-password";

  // create the form data
  const formdata = new FormData();
  formdata.append("username", username);
  formdata.append("password", password);
  formdata.append("remember", "true");

  // send the login request to steal the cookies
  const loginResp = await fetch("https://3dspaint.com/", {
    method: "POST",
    body: formdata,
    redirect: "manual",
    credentials: "include",
  });
  const loginText = await loginResp.text();
  console.log(
    loginResp.status,
    loginResp.headers.getSetCookie(),
    loginText.includes(username),
    loginText.includes("Guest"),
  );

  // set the cookies
  jar.removeAllCookiesSync();
  for (const cookie of loginResp.headers.getSetCookie()) {
    jar.setCookieSync(cookie, "https://3dspaint.com");
  }

  // verify login
  const pingResp = await fetch2(
    `https://3dspaint.com/chatroom?ajax=${+new Date()}&id=Debug&action=post&post=It is currently ${new Date()}&color=ace`,
    {
      method: "GET",
      credentials: "include",
      dispatcher: agent,
    },
  );
  const pingJSON = await pingResp.text();
  console.log(pingResp.status, pingResp.headers.getSetCookie(), pingJSON);
}

/**
 * Determines whether the cookie jar is valid for user-gated requests
 * @returns whether the cookies in the jar are valid
 */
function cookiesValid() {
  const cookies = jar.getCookiesSync("https://3dspaint.com");

  let hasSession = false,
    hasToken = false;
  for (const cookie of cookies) {
    const expiry = cookie.expiryDate();
    if (expiry && expiry < new Date()) return false;

    if (cookie.key === "PHPSESSID") hasSession = true;
    else if (cookie.key === "token") hasToken = true;
  }

  return hasSession && hasToken;
}

// ! CHATROOM FUNCTIONS

/**
 * Fetches the most recent NEW messages in a chatroom
 * @param chatroom the chatroom to fetch the messages for
 * @returns the most recent new messages to the chatroom
 */
export async function getChatroomMsgs(chatroom: string) {
  const resp = await fetch(
    `https://3dspaint.com/chatroom?ajax=${Number(
      new Date(),
    )}&id=${chatroom}&action=read`,
    {
      method: "GET",
      redirect: "follow",
    },
  );

  return (await resp.json()) as ChatMessage[];
}

/**
 * Sends a message to a given chatroom with the given username color.
 * @param chatroom the chatroom to send this message to
 * @param message the message to send to the chatroom
 * @param color the color of the username to display with the message (defaults to #ace)
 */
export async function sendChatroomMsg(
  chatroom: string,
  message: string,
  color = "ace",
) {
  if (!cookiesValid()) await init();

  const resp = await fetch2(
    `https://3dspaint.com/chatroom?ajax=${+new Date()}&id=${chatroom}&action=post&post=${encodeURI(message)}&color=${encodeURI(color)}`,
    {
      method: "GET",
      credentials: "include",
      dispatcher: agent,
    },
  );

  const text = await resp.text();
  if (text.length > 0) {
    // sent back the "you must log in to post"
    await init();

    // only retry once
    await fetch2(
      `https://3dspaint.com/chatroom?ajax=${+new Date()}&id=${chatroom}&action=post&post=${encodeURI(message)}&color=${encodeURI(color)}`,
      {
        method: "GET",
        credentials: "include",
        dispatcher: agent,
      },
    );
  }
}

// ! GROUP FUNCTIONS

/**
 * Fetches all visible group shouts in the given group's shoutbox
 * @param groupID the ID of the group to fetch the shouts for
 * @returns all visible group shouts to the chatroom
 */
export async function getGroupShouts(groupID: number) {
  const resp = await fetch(
    `https://3dspaint.com/group/shoutbox.php?ajax=${Number(
      new Date(),
    )}&action=load&id=${groupID}`,
    {
      method: "GET",
      redirect: "follow",
    },
  );

  // if the group no longer exists, do not attempt to convert the shouts
  if (resp.redirected) return [];

  const output = (await resp.json()) as Shout[];
  return output.reverse();
}

/**
 * Fetches the name of the group
 * @param groupID the ID of the group to fetch the name for
 * @returns the name of the given group
 */
export async function getGroupName(groupID: number) {
  const resp = await fetch(`https://3dspaint.com/group/?id=${groupID}`, {
    method: "GET",
    redirect: "follow",
  });

  // if the group no longer exists, do not attempt to convert the shouts
  if (resp.redirected) return "";

  const text = await resp.text();
  let groupName = "";
  walk(parse(text), {
    enter(node) {
      if (node.type === SyntaxKind.Tag && node.name === "h1" && !groupName) {
        let leaf = node.body?.[0];
        while (leaf?.type === SyntaxKind.Tag) leaf = leaf.body?.[0];
        if (leaf) groupName = leaf.value;
      }
    },
  });

  return groupName;
}

export async function sendShoutboxMsg(groupID: number, message: string) {
  if (!cookiesValid()) await init();

  const resp = await fetch2(
    `https://3dspaint.com/group/shoutbox.php?ajax=${+new Date()}&id=${groupID}&action=post&post=${encodeURI(message)}`,
    {
      method: "GET",
      credentials: "include",
      dispatcher: agent,
    },
  );

  const text = await resp.text();
  if (text !== "[]") {
    // sent back something besides the expected empty array
    await init();

    // only retry once
    await fetch2(
      `https://3dspaint.com/group/shoutbox.php?ajax=${+new Date()}&id=${groupID}&action=post&post=${encodeURI(message)}`,
      {
        method: "GET",
        credentials: "include",
        dispatcher: agent,
      },
    );
  }
}

// ! DISCORD EMBEDDING

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
  const parsed = parseMsgString(
    msg.username ? msg.text : msg.text.replace(/_/g, "\\_"),
    msg.username ? "" : "_",
    msg.username ? "" : "_",
  );

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
          .setImage(correctImage(image)),
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
          .setImage(image),
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
  "/images/thumb_down.png": "<:disagree:1255380820911456367>",
  "https://3dspaint.com/images/thumb_down.png":
    "<:disagree:1255380820911456367>",
  "/images/thumb_up.png": "<:agree:1255379952602451980>",
  "https://3dspaint.com/images/thumb_up.png": "<:agree:1255379952602451980>",
};

/**
 * Converts an HTML string into an usable format
 * @param msgString the HTML string to parse
 * @param initialString the string to prepend to the text
 * @param finalString the string to append to the text
 * @returns plaintext and image data contained in the given HTML string
 */
export function parseMsgString(
  msgString: string,
  initialString: string = "",
  finalString: string = "",
) {
  const parsed = parse(msgString, { setAttributeMap: true });

  let text = initialString;
  const images: string[] = [];
  walk(parsed, {
    enter(node) {
      if (node.type === SyntaxKind.Text) {
        text += decode(
          node.value.replace(/\s+/g, " "),
          // .replace(/([_~*])/gm, "\\$1")
        );
      } else if (node.type === SyntaxKind.Tag) {
        switch (node.name) {
          case "a":
            text += "[";
            break;
          case "span":
            // care only for [b] or [u]
            let style = node.attributeMap?.style.value?.value;
            if (style === "font-weight:bold") {
              text += "**";
            } else if (style === "text-decoration:underline") {
              text += "__";
            }
            break;
          case "img":
            let src = node.attributeMap?.src.value?.value;
            if (!src) break;

            if (emotes[src]) {
              text += emotes[src];
            } else {
              if (src.startsWith("/")) src = "https://3dspaint.com" + src;
              images.push(src);
            }
            break;
          case "blockquote":
            text += "\n> ";
          case "hr":
          case "br":
            text += "\n";
            break;
        }
      }
    },

    leave(node) {
      if (node.type === SyntaxKind.Tag) {
        switch (node.name) {
          case "a":
            if (text.endsWith("[")) text += "LINK";

            let href = node.attributeMap?.href.value?.value;
            if (href?.startsWith("/")) href = "https://3dspaint.com" + href;
            text += `](${href})`;
            break;

          case "span":
            // care only for [b] or [u]
            let style = node.attributeMap?.style.value?.value;
            if (style === "font-weight:bold") {
              text += "**";
            } else if (style === "text-decoration:underline") {
              text += "__";
            }
            break;

          case "blockquote":
            text += "\n";
        }
      }
    },
  });

  text += finalString;
  text = text.replace(/\[(.+)\]\(\1\)/gm, "<$1>");

  return { text, images };
}
