import { parse } from 'https://deno.land/x/std/encoding/csv.ts'
import { Rule } from './rule.ts'
import localConfig from '../config.ts'

// interface of config from user
export interface AppConfig {
  server: {
    port: string | number;
  };
  scrapbox?: {
    host: string;
    project: string;
    cookie?: string;
  };
  slack?: {
    webhook: string;
  };
  rules?: Rule[];
  external?: {
    rules?: {
      scrapboxCsv?: string
    }
  }
}

class Config implements AppConfig {
  public server
  public scrapbox
  public slack
  public rules
  public external

  private originalConfig: AppConfig
  private lastCSVFetched: number = 0
  private fetchedRules: Rule[]

  constructor (config: AppConfig) {
    this.originalConfig = config
    const env = Deno.env()

    this.server = { port: env['PORT'] || config.server.port || '8080' }
    this.scrapbox = Object.assign({
      host: env['SCRAPBOX_HOST'],
      project: env['SCRAPBOX_PROJECT'],
      cookie: env['SCRAPBOX_COOKIE']
    }, config.scrapbox)
    this.slack = Object.assign({ webhook: env['SLACK_WEBHOOK_URL'] }, config.slack)
    this.external = Object.assign({
      rules: {
        scrapboxCsv: env['EXTERNAL_RULE_CSV']
      }
    }, config.external)
  }

  async getConfig (): Promise<AppConfig> {
    this.rules = [ ...this.originalConfig.rules, ...(await this.fetchRules()) ]
    return this
  }

  private async fetchRules () {
    if (!('scrapboxCsv' in this.originalConfig.external.rules)) {
      return []
    }
    if (Date.now() - this.lastCSVFetched < 5000) {
      return this.fetchedRules
    }

    const cookie = this.originalConfig.scrapbox ? this.originalConfig.scrapbox.cookie : ''
    const res = await fetch(this.originalConfig.external.rules.scrapboxCsv, {
      headers: {
        'Cookie': `connect.sid=${cookie}`
      }
    })

    if (res.ok) {
      const data = await parse(await res.text(), { header: true })
      const rules = data.map(r => {
        const row = r as object // FIXME: how treat 'unknown' object?
        return { title: row['title'], body: row['body'], diff: row['diff'], channel: row['channel'] }
      })
      this.fetchedRules = rules
      console.info(`Fetched ${this.fetchedRules.length} rules\n`)
    } else {
      this.fetchedRules = this.fetchedRules || []
    }

    this.lastCSVFetched = Date.now()
    return this.fetchedRules
  }
}

let globalConfig

export function changeConfigForTesting (configForTest: AppConfig) {
  globalConfig = new Config(configForTest)
}

export async function getConfig (): Promise<AppConfig> {
  if (!globalConfig) {
    globalConfig = new Config(localConfig)
  }
  return globalConfig.getConfig()
}
