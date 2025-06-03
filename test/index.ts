// const formdata = new FormData();
// formdata.append("username", "GuiedGui");
// formdata.append("password", "••••••");
// formdata.append("remember", "true");

import { backOff } from "exponential-backoff";

// fetch("https://3dspaint.com/index.php", {
//   method: "GET",
//   mode: "cors",
//   redirect: "follow",
//   credentials: "include",
// })
//   .then((response) => {
//     console.log(response.url);
//     console.log(response.headers);
//     return response.text();
//   })
//   .then((text) => console.log(text.includes(process.env.PAINT_USERNAME || "")))
//   .then(() =>
//     fetch("https://3dspaint.com/index.php", {
//       method: "POST",
//       mode: "cors",
//       body: formdata,
//       credentials: "include",
//       redirect: "follow",
//     })
//   )
//   .then((response) => {
//     console.log(response.url);
//     console.log(response.headers);
//     return response.text();
//   })
//   .then((text) => console.log(text.includes(process.env.PAINT_USERNAME || "")))
//   .catch(console.error);

backOff(
  async () => {
    console.log("BANG!");
    throw new Error();
  },
  { numOfAttempts: 5 }
);
