/* tslint:disable:max-line-length */
import { I18n } from './index'

export class ZhHans implements I18n {
    help = (): string => '使用帮助: TODO'

    originalLink = (): string => '原始链接'

    welcome = () =>
        `欢迎使用 Jikeview Bot，这个 bot 可以帮助将「即刻APP」的 Post 转换为 Telegram 的富文本形式，方便您在 Telegram 与朋友分享即刻消息与动态

        使用帮助：/help`
            .split('\n').map(it => it.trim()).join('\n')

    fail = (): string => '抓取失败🌚'

    notFoundJikeUrl(): string {
        return '未找到即刻消息链接😕'
    }
}
