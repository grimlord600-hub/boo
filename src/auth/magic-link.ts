export interface ParsedMagicLink {
  oobCode: string;
  apiKey?: string;
  continueUrl?: string;
}

export function parseMagicLink(url: string): ParsedMagicLink {
  const trimmed = url.trim();
  const outer = new URL(trimmed);
  let innerUrl = outer.searchParams.get("link");
  if (!innerUrl) {
    innerUrl = trimmed;
  } else {
    innerUrl = decodeURIComponent(innerUrl);
  }
  const inner = new URL(innerUrl);
  const oobCode = inner.searchParams.get("oobCode");
  if (!oobCode) {
    throw new Error("Could not parse oobCode from magic link URL");
  }
  return {
    oobCode,
    apiKey: inner.searchParams.get("apiKey") ?? undefined,
    continueUrl: inner.searchParams.get("continueUrl") ?? undefined,
  };
}
