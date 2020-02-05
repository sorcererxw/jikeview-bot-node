import { bot } from './bot'
import * as config from 'config'

function launchBot(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    return bot.launch({
      webhook: {
        domain: config.get<string>('domain'),
        hookPath: '/tghook',
        port: config.get<number>('port'),
      },
    })
  } else if (process.env.NODE_ENV === 'dev') {
    return bot.launch()
  }
}

launchBot()
