import { parse, walk } from "html5parser";

const toParse =
  'I am. <img src="/chatroom/smilies/alien1.gif" /> <a href="/member?id=171847">@R3TR07098</a>';

const parsed = parse(toParse);

walk(parsed, {
  enter(node) {
    if (node.type === "Text") {
      console.log(node.value);
    } else if (node.type === "Tag") {
      console.log(`[${node.name}]`);
      for (const attribute of node.attributes) {
        console.log("-", attribute.name.value, attribute.value?.value);
      }
    }
  },

  leave(node) {
    if (node.type === "Tag") {
      console.log(`[/${node.name}]`);
    }
  },
});
