import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import {
  assertEquals,
  assertArrayContains,
  assert
} from "https://deno.land/std/testing/asserts.ts";
import { getConfig, changeConfigForTesting, AppConfig } from "../src/config.ts";
const { exit } = Deno;

function dirname(): string {
  const regexp = /(?<scheme>.+):\/\/(?<basename>.+)\/(?<filename>.+)/;
  return import.meta.url.match(regexp).groups.basename;
}

test({
  name: "parse collectly",
  async fn() {
    const data: AppConfig = {
      server: {
        port: 8080
      },
      rules: [{ title: "test", channel: "#test" }],
      external: {
        rules: {
          scrapboxCsv:
            "https://scrapbox.io/api/table/mactkg-pub/shibaura_config_for_test/settings.csv"
        }
      }
    };
    changeConfigForTesting(data);

    const config = await getConfig();
    assertEquals(config.server.port, 8080);
    assertEquals(config.slack.webhook, undefined);
    assertEquals(config.rules.length, 3);
    assert(
      config.rules.findIndex(r => {
        return r.title == "test" && r.channel == "#test";
      }) >= 0,
      "rule from config.ts"
    );
    assert(
      config.rules.findIndex(r => {
        return r.diff == ".icon" && r.channel == "#sc_comment";
      }) >= 0,
      "rule from scrapbox"
    );
  }
});

test({
  name: "missed csv but ok",
  async fn() {
    const data: AppConfig = {
      server: {
        port: 8080
      },
      rules: [{ title: "test", channel: "#test" }],
      external: {
        rules: {
          scrapboxCsv:
            "https://scrapbox.io/api/table/mactkg-pub/shibaura_config_for_test/settings_maybe_not_found.csv"
        }
      }
    };
    changeConfigForTesting(data);

    const config = await getConfig();
    assertEquals(config.server.port, 8080);
    assert(
      config.rules.findIndex(r => {
        return r.title == "test" && r.channel == "#test";
      }) >= 0,
      "rule from config.ts"
    );
  }
});

(async () => {
  await runTests();
  exit(0);
})();
