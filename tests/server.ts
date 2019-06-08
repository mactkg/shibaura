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
        {title: "shibaura test", diff: "if", channel: "#complex_notice"},
        {diff: ".icon", channel: "#comment_notice"}
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
            "text":"New lines on <https://scrapbox.io/mactkg-pub/|mactkg-pub>",
            "mrkdwn":true,
            "username":"Scrapbox",
            "attachments":[
                {
                    "title":"shibaura test",
                    "title_link":"https://scrapbox.io/mactkg-pub/shibaura_test#5cfb1e5f5e52790000aab5d0",
                    "text":"diffdiff\n<https://scrapbox.io/mactkg-pub/body|#body>",
                    "rawText":"diffdiff\n#body",
                    "mrkdwn_in":["text"],
                    "author_name":"Kenta Hara"
                },
                {
                    "title":"test page",
                    "title_link":"https://scrapbox.io/mactkg-pub/test_page#5cf7bf77d9a6e100175758b9",
                    "text":"test page\n<https://scrapbox.io/mactkg-pub/bookmark|#bookmark> again how about this  *mactkg* ",
                    "rawText":"test page\n#bookmark again how about this [mactkg.icon]",
                    "mrkdwn_in":["text"],
                    "author_name":"Kenta Hara"
                }
            ]
        })
        const result = await fetch('http://localhost:8001/scrapbox', {
            method: "POST",
            headers: [
                ["Content-Type", "application/json;charset=utf-8"]
            ],
            body
        })

        const json = await result.json()
        assertEquals(result.status, 200)
        assertEquals(json[0].title, "shibaura test")
        assertEquals(json[1].title, "test page")
        assertArrayContains(json[0].channels, ["#title_notice", "#diff_notice", "#body_notice","#complex_notice"])
        assertArrayContains(json[1].channels, ["#comment_notice"])
    }
});

(async () => {
    await runTests();
    exit(0);
})();
