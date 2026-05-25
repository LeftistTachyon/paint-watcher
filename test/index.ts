import { parseMsgString } from "../src/request";
(async () => {
  console.log(
    parseMsgString(
      // `<div style="clear:both">Me when the <span style="font-weight:bold">3PM</span> melody <span style="text-decoration:underline">hits</span>:</div>`,
      // `<a href="https://www.youtube.com/watch?v=a4na2opArGY" rel="nofollow">Dandadan dandadan dandadan dandadan dandadan, Dandadan dandadan dandadan dandadan dandadan, Dandadan dandadan dandadan dandadan dandadan, Dandadan dandadan dandadan.</a>`,
      `hi <a href="https://mh.lurc.cc/upload/igr-DX98SOSMYw3.mp4" rel="nofollow">have a <span style="font-weight:bold">meme</span></a>`,
    ),
  );
})();
