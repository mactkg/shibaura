import { test, runTests } from 'https://deno.land/std/testing/mod.ts'
import {
  assertEquals,
  assert
} from 'https://deno.land/std/testing/asserts.ts'
import { getConfig, changeConfigForTesting, AppConfig } from '../src/config.ts'
const { exit } = Deno

test({
  name: 'parse collectly',
  async fn () {
    changeConfigForTesting({
      server: {
        port: "8080"
      },
      external: {
        ruleScrapboxUrl: 'https://scrapbox.io/api/table/mactkg-pub/shibaura_config_for_test/settings.csv'
      }
    })

    const config = await getConfig()
    assertEquals(config.server.port, "8080")
    assertEquals(config.slack.webhook, undefined)
    assertEquals(config.rules.length, 2)
    assert(
      config.rules.findIndex(r => {
        return r.diff === '.icon' && r.channel === '#sc_comment'
      }) >= 0,
      'rule from scrapbox'
    )
  }
})

test({
  name: 'missed csv but ok',
  async fn () {
    changeConfigForTesting({
      server: {
        port: "8080"
      },
      external: {
        ruleScrapboxUrl: 'https://scrapbox.io/api/table/mactkg-pub/shibaura_config_for_test/settings_maybe_not_found.csv'
      }
    })

    const config = await getConfig()
    assertEquals(config.rules.length, 0)
  }
});

(async () => {
  await runTests()
  exit(0)
})()
