import { decode } from "he";

console.log(
  decode(
    "&ldquo;&rdquo;&ldquo;&quot;&rdquo;&ldquo;&quot;&rdquo;&ldquo;&rdquo;&quot;&rdquo;&ldquo;&Prime;&Prime;&quot;&ldquo;&Prime;"
  )
);
