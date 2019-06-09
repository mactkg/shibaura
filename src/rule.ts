export interface Rule {
  title?: string;
  body?: string;
  diff?: string;
  channel: string
}

export function useMatcher (rules: Rule[]) : ((title : string, body : string, diff : string) => string[]) {
  return (title : string, body : string, diff : string): string[] => {
    return rules.filter(rule => {
      return title.indexOf(rule.title) >= 0 ||
        body.indexOf(rule.body) >= 0 ||
        diff.indexOf(rule.diff) >= 0
    }).map(rule => rule.channel)
  }
}
