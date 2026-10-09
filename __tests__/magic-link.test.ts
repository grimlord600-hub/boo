import { parseMagicLink } from "../src/auth/magic-link.js";

const SAMPLE =
  "https://boo-dating-prod.firebaseapp.com/__/auth/links?link=https://login.boo.world/__/auth/action?apiKey%3DAIzaSyBd4tZV38BT2DD2-K00W60vbB7ebtE1xYg%26mode%3DsignIn%26oobCode%3DtestOobCode123%26continueUrl%3Dhttps://boo.dating%26lang%3Den";

describe("parseMagicLink", () => {
  it("extracts oobCode and apiKey", () => {
    const parsed = parseMagicLink(SAMPLE);
    expect(parsed.oobCode).toBe("testOobCode123");
    expect(parsed.apiKey).toBe("AIzaSyBd4tZV38BT2DD2-K00W60vbB7ebtE1xYg");
    expect(parsed.continueUrl).toBe("https://boo.dating");
  });
});
