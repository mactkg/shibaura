import {
  App as Dinatra,
  get,
  post,
  contentType
} from 'https://denopkg.com/syumai/dinatra/mod.ts'
import { Response } from 'https://denopkg.com/syumai/dinatra/response.ts'
import { Config, getConfig, AppConfig } from './config.ts'
import { useMatcher } from './rule.ts'
import { postToSlack } from './slack.ts'
import { fetchPageText, buildPageURL } from './scrapbox.ts'

export function App (config: Config | AppConfig): Dinatra {
  const matcher = useMatcher(config.rules)
  const handlers = [
    get('/', () => 200),
    post('/scrapbox', async ({ params }) : Promise<number | Response> => {
      if (!(params.attachments instanceof Array)) {
        return 400
      }

      if(config instanceof Config) {
        await config.getConfig() // refetch config
      }

      console.debug(`Recieved ${params.attachments.length} notification(s)\n`)
      const results = await Promise.all(params.attachments.flatMap(async attachment => {
        const { title, rawText: diff } = attachment
        console.debug(`* Start proessing: ${title}\n`)
        const body = await fetchPageText(buildPageURL(config.scrapbox.host, config.scrapbox.project, title), config.scrapbox.cookie)
        console.debug(`diff: ${diff.length} chars, body: ${body.length} chars\n`)
        const channels = matcher(title, body, diff)
        console.debug(`${channels.length} match(es) found: ${channels} for ${title}\n`)

        await Promise.all(channels.map(async ch => {
          const url = config.slack ? config.slack.webhook : 'https://httpbin.org/post'
          await postToSlack(url, attachment, Object.assign({}, { channel: ch , username: "Shibaura Scrapbox", icon_emoji: ":scrapbox:" }, config.slack.options ))
        }))

        return { title, channels }
      }))
      return [200, contentType('json'), JSON.stringify(results)]
    }),

    get('/info', () => [
      200,
      contentType('json'),
      JSON.stringify({ app: 'dinatra', version: '0.0.1' })
    ])
  ]

  const app = new Dinatra(String(config.server.port))
  app.handle(...handlers)
  return app
}

// main
if (import.meta.main) {
  (async () => {
    const config = await getConfig()
    const app = App(config)
    app.serve()
  })()
}
