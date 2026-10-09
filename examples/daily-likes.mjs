/**
 * Daily + interest likes, same loop as the Python BooAPI workflow.
 *
 *   npm run build
 *   node examples/daily-likes.mjs
 *   node examples/daily-likes.mjs --max 5 --delay 2
 *
 * Needs a saved session from scripts/run.mjs login.
 */
import { fileURLToPath } from "node:url";
import { BooApiError, BooClient, FileTokenStore } from "../dist/index.js";

const sessionPath = fileURLToPath(new URL("../.boo-session.json", import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

const config = {
  maxLikesPerMode: Number(arg("--max") ?? 10),
  delaySeconds: Number(arg("--delay") ?? 2),
  refreshDelaySeconds: Number(arg("--refresh-delay") ?? 5),
  gender: (arg("--gender") ?? "female").toLowerCase(),
  interestName: arg("--interest"),
};

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function log(message, ...rest) {
  console.log(`[logs] ${message}`, ...rest);
}

async function getProfiles(client, mode) {
  if (mode === "daily") {
    const { profiles } = await client.user.dailyProfiles();
    return profiles ?? [];
  }

  const interestName =
    config.interestName ??
    (await client.interest.popular()).interests?.[0]?.name;
  if (!interestName) return [];
  log(`interest mode using "${interestName}"`);
  const { users } = await client.interest.users(interestName);
  return users ?? [];
}

async function processMode(client, mode) {
  let likedCount = 0;
  const seenIds = new Set();
  let consecutiveEmptyFetches = 0;

  while (likedCount < config.maxLikesPerMode) {
    const profiles = await getProfiles(client, mode);
    if (!profiles.length) {
      log(`${mode} mode found no more profiles.`);
      break;
    }

    let foundNewProfile = false;
    for (const profile of profiles) {
      if (likedCount >= config.maxLikesPerMode) break;

      const userId = profile?._id;
      if (!userId || seenIds.has(userId)) continue;

      foundNewProfile = true;
      seenIds.add(userId);
      if ((profile.gender ?? "").toLowerCase() !== config.gender) continue;

      try {
        const swipe = await client.user.sendLike({
          user: userId,
          source: mode,
        });
        likedCount += 1;
        log(
          `${mode} like ${likedCount}/${config.maxLikesPerMode} ${profile.firstName ?? userId} swipesLeft=${swipe.numSwipesRemaining}`,
        );
        if (swipe.numSwipesRemaining === 0) return likedCount;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[error] ${mode} like failed for ${userId}: ${message}`);
      }
      await sleep(config.delaySeconds);
    }

    if (!foundNewProfile) {
      consecutiveEmptyFetches += 1;
      if (consecutiveEmptyFetches >= 2) break;
    } else {
      consecutiveEmptyFetches = 0;
      if (likedCount < config.maxLikesPerMode) {
        await sleep(config.refreshDelaySeconds);
      }
    }
  }

  log(`${mode} mode complete: ${likedCount} likes.`);
  return likedCount;
}

async function setPreferences(client) {
  await client.user.preferences({
    personality: [],
    gender: [],
    distance: 0,
    minAge: 18,
    maxAge: 200,
    purpose: [],
    dating: [config.gender],
    friends: [config.gender],
    local: true,
    global: true,
    countries: [],
    interests: null,
    enneagrams: [],
    horoscopes: [],
    interestNames: [],
    languages: [],
    keywords: [],
    exercise: [],
    educationLevel: [],
    drinking: [],
    smoking: [],
    kids: [],
    religion: [],
    distance2: 100,
    bioLength: 600,
    sameCountryOnly: false,
    ethnicities: [],
    minHeight: 0,
    maxHeight: 0,
    relationshipStatus: [],
    datingSubPreferences: [],
    showUsersOutsideMyRange: false,
    sexuality: [],
    relationshipType: [],
    showUnspecified: null,
    excludedInterestNames: [],
    showSingpassVerifiedOnly: false,
  });
}

async function runBooAutomation() {
  const client = new BooClient({
    debugLogs: true,
    logErrors: true,
    tokenStore: new FileTokenStore(sessionPath),
  });

  if (!(await client.loadSession())) {
    throw new Error("No .boo-session.json. Run: node scripts/run.mjs login --email you@example.com --magic-link \"URL\"");
  }

  try {
    await client.refreshSession();
  } catch (error) {
    const message = error instanceof BooApiError || error instanceof Error
      ? error.message
      : String(error);
    console.error(`[error] automation skipped: ${message}`);
    return { daily: 0, interest: 0, total: 0 };
  }

  await setPreferences(client);
  const daily = await processMode(client, "daily");
  const interest = await processMode(client, "interest");
  const total = daily + interest;
  log(`automation complete: ${total} total likes.`);
  return { daily, interest, total };
}

runBooAutomation()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error("[error]", error.message ?? error);
    process.exit(1);
  });
