import { parse } from "https://deno.land/x/std/encoding/toml.ts";
import { Rule } from "./rule.ts";
const { readFile } = Deno;

export interface AppConfig {
  server: {
    port: string;
  };
  scrapbox?: {
    host: string;
    project: string;
    cookie: string;
  };
  slack?: {
    webhook: string;
  };
  rules?: Rule[];
}

export async function loadConfig(path = "config.toml"): Promise<AppConfig> {
  const decoder = new TextDecoder("utf-8");
  const file = await readFile(path);
  const config = parse(decoder.decode(file));

  return config as AppConfig;
}
