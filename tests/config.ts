import { test, runTests } from 'https://deno.land/std/testing/mod.ts';
import { assertEquals, assertArrayContains, assertThrowsAsync } from 'https://deno.land/std/testing/asserts.ts';
import { loadConfig } from "../src/config.ts";
const { exit, cwd } = Deno;

function dirname(): string {
    const regexp = /(?<scheme>.+):\/\/(?<basename>.+)\/(?<filename>.+)/
    return import.meta.url.match(regexp).groups.basename
}

test({
    name: "parse collectly",
    async fn() {
        const config = await loadConfig(`${dirname()}/assets/test_config.toml`)
        assertEquals(config.server.port, 8080)
        assertEquals(config.slack, undefined)
    }
});

test({
    name: "no such file or directory error",
    async fn() {
        await assertThrowsAsync(async () => {
            await loadConfig(`${dirname()}/assets/test_config.tomllll`)
        },)
    }
});

(async () => {
    console.log(import.meta.url)
    await runTests();
    exit(0);
})();
