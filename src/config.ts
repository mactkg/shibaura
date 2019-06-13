import { parse } from 'https://deno.land/x/std/encoding/csv.ts'
import { Rule } from './rule.ts'
import localConfig from '../config.ts'

// interface of config from user
export interface AppConfig {
  server: {
    port: string;
  };
  scrapbox?: {
    host: string;
    project: string;
    cookie?: string;
  };
  slack?: {
    webhook: string;
    options?: object;
  };
  rules?: Rule[];
  external?: {
    ruleScrapboxUrl?: string;
  };
}

export class Config implements AppConfig {
  // public for testing...
  public server
  public scrapbox
  public slack
  public rules
  public external

  private original: AppConfig
  private lastCSVFetched: number = 0
  private fetchedRules: Rule[] = []

  constructor (config: AppConfig) {
    this.original = config
    this.server = config.server || {}
    this.scrapbox = config.scrapbox || {}
    this.slack = config.slack || {}
    this.rules = config.rules || []
    this.external = config.external || {}
  }

  async getConfig (): Promise<Config> {
    this.rules = [ ...(this.original.rules || []), ...(await this.fetchRules()) ]
    return this
  }

  private async fetchRules () {
    if (!this.external.ruleScrapboxUrl) {
      return []
    }
    if (Date.now() - this.lastCSVFetched < 5000) {
      return this.fetchedRules
    }

    const res = await fetch(this.external.ruleScrapboxUrl, {
      headers: {
        'Cookie': `connect.sid=${this.scrapbox.cookie || ''}`
      }
    })

    if (res.ok) {
      this.fetchedRules = await this.parseCSV(await res.text())
      console.debug(`Fetched ${this.fetchedRules.length} rules:`, this.fetchedRules.map(r => {
        return JSON.stringify(r)
      }).join('\n'))
    } else {
      this.fetchedRules = this.fetchedRules || []
    }

    this.lastCSVFetched = Date.now()
    return this.fetchedRules
  }

  private async parseCSV(csv: string): Promise<Rule[]> {
    const data = await parse(csv, { header: true }).catch((e) => {
      console.error(`ParseError: ${e}`)
      return [] as unknown[]
    })
    const rules = data.map(r => {
      const row = r as object // FIXME: how treat 'unknown' object?
      return { title: row['title'], body: row['body'], diff: row['diff'], channel: row['channel'] }
    })
    return rules
  }
}

let globalConfig: Config
export function changeConfigForTesting(customConfig: AppConfig) {
  globalConfig = new Config(customConfig)
}

export async function getConfig (): Promise<Config> {
  if (!globalConfig) {
    globalConfig = new Config(localConfig)
  }
  return globalConfig.getConfig()
}

