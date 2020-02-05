import { I18n } from './index'

export class EnUs implements I18n {
  help = () => `Just share Jike post link to me, and I'll reply the Telegram rich content to you.`
  originalLink = () => 'Original Link'
  welcome = () => 'welcome'
  fail = () => 'fail'
  notFoundJikeUrl = () => 'Not found Jike post url'
  share = () => 'Share'
}
