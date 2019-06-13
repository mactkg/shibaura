export interface Rule {
  title?: string;
  body?: string;
  diff?: string;
  channel: string
}

const uniq = array => [...new Set<string>(array)];

export function useMatcher (rules: Rule[]) : ((title : string, body : string, diff : string) => string[]) {
  return (title : string, body : string, diff : string): string[] => {
    return uniq(rules.filter(rule => {
      return rule.title != '' && title.indexOf(rule.title) >= 0 ||
        rule.body != '' && body.indexOf(rule.body) >= 0 ||
        rule.diff != '' && diff.indexOf(rule.diff) >= 0
    }).map(rule => rule.channel))
  }
}
