import {
    App as Dinatra,
    get,
    post,
    contentType,
  } from 'https://denopkg.com/syumai/dinatra/mod.ts';
import { Response } from "https://denopkg.com/syumai/dinatra/response.ts";
import { AppConfig, loadConfig } from './config.ts';
import { useMatcher } from "./rule.ts";
import { postToSlack } from "./slack.ts";
import { fetchPageText, buildPageURL } from "./scrapbox.ts";

export function App(config: AppConfig): Dinatra {
  const matcher = useMatcher(config.rules)
  const handlers = [
    post('/scrapbox', async ({ params }) : Promise<number | Response> => {
      if(!(params.attachments instanceof Array)) {
        return 400
      }

      const results = await Promise.all(params.attachments.flatMap(async attachment => {
        const { title, rawText: diff } = attachment
        const body = await fetchPageText(buildPageURL(config.scrapbox.host, config.scrapbox.project, title), config.scrapbox.cookie)
        const channels = matcher(title, body, diff)

        await Promise.all(channels.map(async ch => {
          const url = config.slack ? config.slack.webhook : 'https://httpbin.org/post'
          await postToSlack(url, { attachment, channel: ch})
        }))

        return { title, channels }
      }));
      return [200, contentType('json'), JSON.stringify(results)]
    }),

    get('/info', () => [
      200,
      contentType('json'),
      JSON.stringify({ app: 'dinatra', version: '0.0.1' }),
    ])
  ]

  const app = new Dinatra(config.server.port)
  app.handle(...handlers)
  return app
}


// main
if(import.meta.main) {
  (async() => {
    const config = await loadConfig('config.toml')
    config.server.port = Deno.env()['PORT'] || config.server.port || '8080' // ENV > toml > 8080
    const app = App(config);
    app.serve();
  })()
}
