/**
 * Runnable Boo client.
 *
 * From boo-node/:
 *   npm run build
 *   node scripts/run.mjs visitor
 *   node scripts/run.mjs link --email you@gmail.com
 *   node scripts/run.mjs login --email you@gmail.com --magic-link "FULL_URL"
 *   node scripts/run.mjs karma
 *   node scripts/run.mjs discover
 */
import { fileURLToPath } from "node:url";
import { BooClient, FileTokenStore } from "../dist/index.js";

const sessionPath = fileURLToPath(new URL("../.boo-session.json", import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function has(name) {
  return process.argv.includes(name);
}

const command = process.argv[2];
const email = arg("--email");
const debug = !has("--quiet");

const client = new BooClient({
  email,
  debugLogs: debug,
  logErrors: true,
  tokenStore: new FileTokenStore(sessionPath),
});

function print(label, value) {
  const text =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  const clipped = text.length > 4000 ? `${text.slice(0, 4000)}\n…` : text;
  console.log(`\n${label}\n${clipped}`);
}

async function main() {
  if (!command || command === "help" || has("--help")) {
    console.log(`Usage:
  node scripts/run.mjs visitor
  node scripts/run.mjs link --email you@gmail.com
  node scripts/run.mjs login --email you@gmail.com --magic-link "URL"
  node scripts/run.mjs karma
  node scripts/run.mjs discover
  node scripts/run.mjs chats

Session file: .boo-session.json
Add --quiet to hide [logs].`);
    return;
  }

  if (command === "visitor") {
    const res = await client.web.appVisitor(false);
    print("appVisitor", res);
    return;
  }

  if (command === "link") {
    if (!email) throw new Error("link requires --email you@example.com");
    await client.requestMagicLink(email);
    console.log(`\nMagic link requested for ${email}. Do not open it in a browser.`);
    console.log(`Then run:\n  node scripts/run.mjs login --email ${email} --magic-link "PASTE_URL"`);
    return;
  }

  if (command === "login") {
    const link = arg("--magic-link");
    if (!link) {
      throw new Error("login requires --magic-link \"FULL_URL\"");
    }
    const session = await client.signInWithMagicLink(link, { initApp: true });
    print("signed in", {
      email: session.email,
      localId: session.localId,
      expiresAt: new Date(session.expiresAt).toISOString(),
    });
    const karma = await client.user.karma();
    print("karma", karma);
    return;
  }

  const loaded = await client.loadSession();
  if (!loaded) {
    throw new Error("No .boo-session.json. Run login first.");
  }

  if (command === "karma") {
    print("karma", await client.user.karma());
    return;
  }
  if (command === "discover") {
    print("discover", await client.user.discover());
    return;
  }
  if (command === "chats") {
    print("chats", await client.chat.sortMessages());
    return;
  }
  if (command === "daily") {
    print("dailyProfiles", await client.user.dailyProfiles());
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((err) => {
  console.error("\n[error]", err.message ?? err);
  process.exit(1);
});
