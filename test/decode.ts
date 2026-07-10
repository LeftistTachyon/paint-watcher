import { parseMsgString } from "../src/request";

console.log(
  parseMsgString(`
<a href=\"\/images\/upload_gallery\/50f4af7f-1984-464a-80e3-10d91b14a5b0.jpg\">
    <img src=\"\/images\/upload_gallery\/50f4af7f-1984-464a-80e3-10d91b14a5b0_thumb.jpg\" alt=\"thumb\">
    <\/a>
        `),
);
