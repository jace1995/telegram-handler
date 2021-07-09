import Telegraf from 'telegraf'
import * as cluster from 'cluster'
import * as https from 'https'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import { TelegramBotSettings } from './start'
import { startServiceLocker } from '../utils/locker-service'

const validateExistsFolder = (path: string) => {
  if (!fs.existsSync(path)) {
    throw new Error(
      `${path} not found, create ssl certificate with files: cert, privkey, fullchain`
    )
  }
}

const fileReader = (sslFolder: string) => (filename: string) => (
  fs.readFileSync(
    path.join(sslFolder, filename)
  )
)

const webhookRejected = (reason: string) => {
  console.error('Error: bot.telegram.setWebhook ' + reason)
  process.exit()
}

const setWebhook = async (bot: Telegraf<any>, webhookUrl: string) => {
  (async () => {
    try {
      const result = await bot.telegram.setWebhook(webhookUrl)

      if (!result) {
        webhookRejected('returned false')
      }
    } catch (error) {
      webhookRejected('rejected with error\n' + error)
    }
  })()
}

const defaults = {
  sslFolder: './ssl',
  webhookPort: 8443,
}
const getBotUrl = (token: string) => '/bot' + token
const getWebhookUrl = (token: string, domain: string, webhookPort: number) => (
  `https://${domain}:${webhookPort}` + getBotUrl(token)
)

export const startWebhookHandler = (
  bot: Telegraf<any>,
  token: string,
  settings: TelegramBotSettings<any, any>
) => new Promise<boolean | undefined>(async resolve => {
  const sslFolder = settings.advanced?.sslFolder ?? defaults.sslFolder
  const webhookPort = settings.advanced?.webhookPort ?? defaults.webhookPort
  const webhookIP = settings.advanced?.webhookIP
  const botUrl = getBotUrl(token)

  const readFileSync = fileReader(sslFolder)

  const server = https.createServer(
    {
      cert: readFileSync('cert.pem'),
      key: readFileSync('privkey.pem'),
      ca: readFileSync('fullchain.pem'),
    },
    bot.webhookCallback(botUrl),
  )
  
  const returning = () => {
    console.log(`worker ${cluster.worker.id} started on port ${webhookPort}`)
    resolve()
  }

  if (webhookIP) {
    server.listen(webhookPort, webhookIP, returning)
  } else {
    server.listen(webhookPort, returning)
  }
})

export const startMasterWebhookService = async (
  bot: Telegraf<any>,
  token: string,
  domain: string,
  settings: TelegramBotSettings<any, any>,
) => {
  const sslFolder = settings.advanced?.sslFolder ?? defaults.sslFolder
  const webhookPort = settings.advanced?.webhookPort ?? defaults.webhookPort
  const webhookUrl = getWebhookUrl(token, domain, webhookPort)

  validateExistsFolder(sslFolder)

  await startServiceLocker(settings.advanced?.lockerPort)
  await setWebhook(bot, webhookUrl)

  const workersCount = settings.advanced?.workersCount ?? os.cpus().length

  for (let i = 0; i < workersCount; i++) {
    cluster.fork()
  }
}
