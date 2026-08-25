import { CookieAgent } from "http-cookie-agent/undici";
import { CookieJar } from "tough-cookie";
import { fetch as fetch2 } from "undici";

(async () => {
  const username = process.env.PAINT_USERNAME || "GuiedGui";

  // create the form data
  const formdata = new FormData();
  formdata.append("username", username);
  formdata.append("password", process.env.PAINT_PSWD || "");
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

  // make the agent
  const jar = new CookieJar();
  // console.log(jar.getCookiesSync("https://3dspaint.com"));
  for (const cookie of loginResp.headers.getSetCookie()) {
    jar.setCookieSync(cookie, "https://3dspaint.com");
  }
  const agent = new CookieAgent({ cookies: { jar } });

  // verify login
  const pingResp = await fetch2(
    `https://3dspaint.com/chatroom?ajax=${+new Date()}&id=Debug&action=post&post=Discord bot says hi&color=ace`,
    {
      method: "GET",
      credentials: "include",
      dispatcher: agent,
    },
  );
  const pingJSON = await pingResp.text();
  console.log(pingResp.status, pingResp.headers.getSetCookie(), pingJSON);

  for (const cookie of jar.getCookiesSync("https://3dspaint.com")) {
    console.log(cookie.expiryDate());
  }

  // // rewrite cookies
  // jar.removeAllCookiesSync();
  // for (const cookie of (
  //   await fetch("https://3dspaint.com/", {
  //     method: "POST",
  //     body: formdata,
  //     redirect: "manual",
  //     credentials: "include",
  //   })
  // ).headers.getSetCookie()) {
  //   jar.setCookieSync(cookie, "https://3dspaint.com");
  // }

  // // and retry
  // await fetch2(
  //   `https://3dspaint.com/chatroom?ajax=${+new Date()}&id=Debug&action=post&post=Discord bot says hi AGAIN&color=ace`,
  //   {
  //     method: "GET",
  //     credentials: "include",
  //     dispatcher: agent,
  //   },
  // );
})();
