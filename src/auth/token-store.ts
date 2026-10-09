import { readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { TokenSession, TokenStore } from "../types.js";

export class MemoryTokenStore implements TokenStore {
  private session: TokenSession | null = null;

  async load(): Promise<TokenSession | null> {
    return this.session;
  }

  async save(session: TokenSession): Promise<void> {
    this.session = session;
  }

  async clear(): Promise<void> {
    this.session = null;
  }
}

export class FileTokenStore implements TokenStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<TokenSession | null> {
    if (!existsSync(this.filePath)) return null;
    const raw = await readFile(this.filePath, "utf8");
    return JSON.parse(raw) as TokenSession;
  }

  async save(session: TokenSession): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(session, null, 2), "utf8");
  }

  async clear(): Promise<void> {
    if (existsSync(this.filePath)) {
      await unlink(this.filePath);
    }
  }
}
