export async function postToSlack (url: string, attachment: {}, options: {}) {
  const body = JSON.stringify({
    attachments: [attachment],
    ...options
  })

  const response = await fetch(url, {
    method: 'POST',
    body
  })
  console.debug('Notified:', { response: await response.text(), body }, '\n')
}
