export async function fetchPageText(url: string, cookie: string = "") {
  const data = await fetch(url, {
    headers: {
      'Cookie' : `connect.sid=${cookie}`
    }
  })
  return data.text()
}

export function buildPageURL(host: string, project: string, title: string) {
  return `${host}/api/pages/${project}/${encodeURIComponent(title)}/text`
}