import { generateShoutboxEmbed } from "../src/request";
import type { Shout } from "../src/type";

const json: Shout[] = [
  {
    id: 3337384,
    name: "GuiedGui",
    member: 140519,
    avatar: "/images/art_gallery/244392.png",
    date: 1783646068000,
    text: "<img name='body_images' src='https://pbs.twimg.com/media/HMzjymdbIAAr_Hy?format=png&amp;name=900x900' style='max-width:100%' />",
  },
];

console.log(JSON.stringify(generateShoutboxEmbed(json[0]), null, 2));
