(async () => {
  const username = process.env.PAINT_USERNAME || "GuiedGui";

  const formdata = new FormData();
  formdata.append("username", username);
  formdata.append("password", process.env.PAINT_PSWD || "");
  formdata.append("remember", "true");

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
    loginText.includes("GuiedGui"),
  );
})();
