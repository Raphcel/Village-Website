import { env as _cfEnv } from "cloudflare:workers";

export function getEnv(): Env | undefined {
  try {
    const e = _cfEnv as unknown as Env;
    return e?.DB ? e : undefined;
  } catch {
    return undefined;
  }
}
