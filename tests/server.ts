import { test, runTests } from 'https://deno.land/std/testing/mod.ts';
import { assertEquals, assertArrayContains } from 'https://deno.land/std/testing/asserts.ts';
import { App } from "../src/server.ts";
const { exit } = Deno;

const testApp = App({
    server: {
        port: '8001'
    },
    scrapbox: {
        host: 'https://scrapbox.io',
        project: 'mactkg-pub',
        cookie: ''
    },
    rules: [
        {title: "shibaura test", channel: "#title_notice"},
        {diff: "diffdiff", channel: "#diff_notice"},
        {body: "#body", channel: "#body_notice"},
        {title: "shibaura test", diff: "if", channel: "#complex_notice"}
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
                    title: "shibaura test",
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

        const json = await result.json()
        assertEquals(result.status, 200)
        assertEquals(json[0].title, "shibaura test")
        assertArrayContains(json[0].channels, ["#body_notice", "#title_notice", "#diff_notice", "#complex_notice"])
    }
});

(async () => {
    await runTests();
    exit(0);
})();
