export async function postToSlack (url: string, options: {attachment: {}, channel?: string}) {
  const body = JSON.stringify({
    attachments: [options.attachment],
    channel: options.channel
  })

  const response = await fetch(url, {
    method: 'POST',
    body
  })
  console.log('Notified:', { response: await response.text(), body }, '\n')
}
