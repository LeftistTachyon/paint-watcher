import { parse, walk } from "html5parser";

const toParse = `I am. <img src="/chatroom/smilies/alien1.gif" /> 
<a href="/member?id=171847">@R3TR07098</a> 
<a href="/" rel="nofollow">TEXT</a> 
<a href="URL" rel="nofollow">URL</a> 
<span style="font-weight:bold">TEXT</span> 
<big>TEXT</big> 
<span style="font-variant:small-caps">TEXT</span> 
<p style="text-align:center">TEXT</p> 
<span style="color:green">TEXT</span> 
<a href="/images/upload_gallery/1000.jpg"><img src="/images/upload_gallery/1000_thumb.jpg" alt="thumb"></a> 
<span style="font-size:12px">TEXT</span> 
<img name="body_images" src="URL" style="max-width:100%"> 
<hr> 
<hr style="width:90%"> 
<blockquote>TEXT</blockquote> 
<p style="text-align:right">TEXT</p> 
<small>TEXT</small> 
<input type="button" class="form_button" style="width:auto;padding:1px 10px" value="Spoiler" onclick="if(this.nextSibling.style.display==\'\'){this.nextSibling.style.display=\'none\';}else{this.nextSibling.style.display=\'\';}"><div class="spoiler_body" style="display:none">CONTENT</div> 
<span style="text-decoration:line-through">TEXT</span> 
[style]TEXT[/style] 
<span style="text-decoration:underline">TEXT</span>`;

// const parsed = parse(toParse);

// let text = "";
// walk(parsed, {
//   enter(node) {
//     if (node.type === "Text") {
//       text += node.value.replace(/\s+/, " ");
//     } else if (node.type === "Tag") {
//       switch (node.name) {
//         case "a":
//           text += "[";
//           break;
//         case "img":
//           process.stdout.write(text);
//           text = "";

//           let src = node.attributes.find(
//             (attribute) => attribute.name.value === "src"
//           )?.value?.value;
//           if (src?.startsWith("/")) src = "https://3dspaint.com" + src;
//           process.stdout.write("IMAGE", src);
//           break;
//       }
//     }
//   },
//   leave(node) {
//     if (node.type === "Tag" && node.name === "a") {
//       let href = node.attributes.find(
//         (attribute) => attribute.name.value === "href"
//       )?.value?.value;
//       if (href?.startsWith("/")) href = "https://3dspaint.com" + href;
//       text += `](${href})`;
//     }
//   },
// });
