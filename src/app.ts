import JikeUrlParser, { JikeUrl } from './jike/jike-url-parser'
import JikeApi from './jike/jike-api'
import TelegramBot, { InputMediaPhoto, Message, Metadata } from 'node-telegram-bot-api'
import { i18n } from './i18n'
import { log } from './utils/logger'

const token = process.env.BOT_TOKEN

if (token === undefined || token.length === 0) {
    log('Please provide BOT_TOKEN in env')
    process.exit(1)
}

const bot = new TelegramBot(token, {
    polling: true,
})

bot.onText(/\/start/, async (msg: Message, _: RegExpExecArray | null) => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).welcome())
})

// bot.onText()

bot.on('message', async (msg: Message, _: Metadata) => {
    const reply = async (text: string) => {
        await bot.sendMessage(msg.chat.id, text)
    }
    log(msg)
    if (msg.text === undefined) {
        return
    }
    const jikeUrls: JikeUrl[] = (msg.text.match(/\bhttps?:\/\/\S+/gi) || [])
        .map((it: string): JikeUrl | null => JikeUrlParser.parser(it))
        .filter((it: JikeUrl | null): boolean => it !== null)
        .reduce((arr: JikeUrl[], v: JikeUrl): JikeUrl[] => arr.concat(v), [])
    if (jikeUrls.length === 0) {
        await reply('not found url')
        return
    }
    jikeUrls.forEach(async it => {
        // const resultMessage = await reply('handle ' + JikeUrlParser.generateMessageUrl(it))
        const post = await JikeApi.getPostByUrl(it)
        if (post === null) {
            await reply('fail')
            return
        }

        if (post.data.pictures !== undefined && post.data.pictures.length > 0) {
            await bot.sendMediaGroup(
                msg.chat.id,
                post.data.pictures.map((it, index) => {
                    return {
                        type: 'photo',
                        media: it.picUrl,
                        caption: index === 0
                            ? post.data.content
                            : undefined,
                    } as InputMediaPhoto
                }),
            )
        } else if (post.data.video !== undefined) {
            // await ctx.replyWithVideo(post.data.pictures[0].picUrl, {caption: post.data.content})
        } else {
            await reply(post.data.content)
        }
    })
})
