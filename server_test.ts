import { test, runTests } from 'https://deno.land/std/testing/mod.ts';
import { assertEquals, assertArrayContains } from 'https://deno.land/std/testing/asserts.ts';
import { App } from "./server.ts";
const { exit } = Deno;

const testApp = App({
    port: '8001',
    rules: [
        {body: "body", channel: "#body_notice"},
        {title: "New Page", channel: "#title_notice"}
    ]
});
testApp.serve();

test({
    name: "400 bad request",
    async fn() {
        const result = await fetch('http://localhost:8001/scrapbox', {
            method: "POST",
            headers: [
                ["Content-Type", "application/json"]
            ],
            body: "{}"
        })

        assertEquals(result.status, 400)
    }
})

test({
    name: "matcher test",
    async fn() {
        const body = JSON.stringify({
            attachments: [
                {
                    title: "New Page",
                    rawText: "diffdiff"
                }
            ]
        })

        const result = await fetch('http://localhost:8001/scrapbox', {
            method: "POST",
            headers: [
                ["Content-Type", "application/json"]
            ],
            body
        })

        assertEquals(result.status, 200)
        assertArrayContains(await result.json(), ["#body_notice", "#title_notice"])
    }
});

(async () => {
    await runTests();
    exit(0);
})();
