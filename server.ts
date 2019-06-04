import {
    App as Dinatra,
    get,
    post,
    contentType,
  } from 'https://denopkg.com/syumai/dinatra/mod.ts';


interface rule {
  title?: string;
  body?: string;
  diff?: string;
  channel: string
}

function fetchPageText(title: string) {
  return `featchedbody of ${title}`
}

export function useMatcher(rules: rule[]) : ((title : string, body : string, diff : string) => string[]) {
  return (title : string, body : string, diff : string): string[] => {
    const channels = [];

    return rules.filter(rule => {
      return title.indexOf(rule.title) >= 0 || 
      body.indexOf(rule.body) >= 0 ||
      diff.indexOf(rule.diff) >= 0
    }).map(rule => rule.channel)
  }
}

async function postToSlack(url: string, options: {attachment: {}, channel?: string}) {
  const body = JSON.stringify({
    attachments: [options.attachment],
    channel: options.channel
  })

  const response = await fetch(url, {
    method: "POST",
    body
  })
  console.log({ response: response.json(), body }, '\n')
}

interface AppConfig {
  port: string,
  scrapbox?: {
    host: string,
    project: string,
    cookie: string
  },
  slack?: {
    webhook: string
  },
  rules?: rule[]
}

export function App(config: AppConfig): Dinatra {
  const matcher = useMatcher(config.rules)
  const handlers = [
    post('/scrapbox', ({ params }) => {
      if(!(params.attachments instanceof Array)) {
        return 400
      }

      const channels = params.attachments.flatMap(attachment => {
        const { title, rawText: diff } = attachment
        const body = fetchPageText(title)
        const channels = matcher(title, body, diff)

        channels.forEach(async ch => {
          const url = config.slack ? config.slack.webhook : 'https://httpbin.org/post'
          await postToSlack(url, { attachment, channel: ch})
        })

        return channels
      });

      return [200, contentType('json'), JSON.stringify(channels)]
    }),

    get('/info', () => [
      200,
      contentType('json'),
      JSON.stringify({ app: 'dinatra', version: '0.0.1' }),
    ])
  ]

  const app = new Dinatra(config.port)
  app.handle(...handlers)
  return app
}


// main
if(import.meta.main) {
  const PORT = Deno.env()['PORT'] || '8080'
  const app = App({port: PORT});
  app.serve();
}
