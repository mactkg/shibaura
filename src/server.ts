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
    post('/scrapbox', async ({ params }) : Promise<number | Response> => {
      if (!(params.attachments instanceof Array)) {
        return 400
      }

      if(config instanceof Config) {
        await config.getConfig() // refetch config
      }

      const results = await Promise.all(params.attachments.flatMap(async attachment => {
        const { title, rawText: diff } = attachment
        const body = await fetchPageText(buildPageURL(config.scrapbox.host, config.scrapbox.project, title), config.scrapbox.cookie)
        const channels = matcher(title, body, diff)
        console.debug(`${channels.length} matches found: ${channels} for ${title}\n`)

        await Promise.all(channels.map(async ch => {
          const url = config.slack ? config.slack.webhook : 'https://httpbin.org/post'
          await postToSlack(url, { attachment, channel: ch })
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
