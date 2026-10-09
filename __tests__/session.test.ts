import {
  isSessionExpiringSoon,
  jwtExpiresAtMs,
  RefreshMutex,
} from "../src/auth/session.js";

// exp in year 2030
const fakeJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4OTM0NTYwMDB9.signature";

describe("jwtExpiresAtMs", () => {
  it("reads exp claim", () => {
    const ms = jwtExpiresAtMs(fakeJwt);
    expect(ms).toBe(1893456000 * 1000);
  });
});

describe("isSessionExpiringSoon", () => {
  it("detects near expiry", () => {
    const session = {
      idToken: "x",
      refreshToken: "y",
      expiresAt: Date.now() + 30_000,
    };
    expect(isSessionExpiringSoon(session, 60_000)).toBe(true);
  });
});

describe("RefreshMutex", () => {
  it("runs exclusive jobs sequentially", async () => {
    const mutex = new RefreshMutex();
    let n = 0;
    await Promise.all([
      mutex.runExclusive(async () => {
        n += 1;
        await new Promise((r) => setTimeout(r, 20));
      }),
      mutex.runExclusive(async () => {
        n += 1;
      }),
    ]);
    expect(n).toBe(2);
  });
});
