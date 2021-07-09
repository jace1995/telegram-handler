import * as url from 'url'
import { MicroserviceHttpHandler } from './start'

export const httpHandler: MicroserviceHttpHandler = handler => async (request, response) => {
  try {
    if (!request.url) {
      return
    }

    const inputData = url.parse(request.url, true).query.data

    if (typeof inputData !== 'string') {
      return
    }

    const resultData = await handler(inputData)

    response.setHeader('Content-Type', 'text/plain')
    response.setHeader('Content-Length', Buffer.byteLength(resultData))
    response.end(resultData)
  } catch(e) {
    console.error(e)
  }
}
