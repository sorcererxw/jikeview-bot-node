import { I18n } from './index'
import { TemplateHandlers } from '../utils/strings'

const { trim } = TemplateHandlers

export class ZhHans implements I18n {
  help = () => '可以直接通过 * 即刻 APP* 分享消息或者复制消息链接给我，我会将消息转成 Telegram 消息发送给您'
  originalLink = () => '原始链接'
  welcome = () => trim`
    欢迎使用 Jikeview，这个 bot 可以帮助将「即刻APP」的 Post 转换为 Telegram 的富文本形式，方便您在 Telegram 与朋友分享即刻消息与动态

    使用帮助：/help
    `
  fail = () => '抓取失败🌚'
  notFoundJikeUrl = () => '未找到即刻消息链接😕'
  share = () => '分享'
}
