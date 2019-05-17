import JikeUrlParser, { JikeUrl } from './jike/jike-url-parser'
import JikeApi from './jike/jike-api'
import TelegramBot, { InputMediaPhoto } from 'node-telegram-bot-api'
import { i18n } from './i18n'
import { log } from './utils/logger'
import M3u8ToMp4Converter from './utils/m3u8-to-mp4-converter'
import * as fs from 'fs'
import { noSpace, trim } from './utils/string-utils'

const m3u8ToMp4Converter = new M3u8ToMp4Converter()

const bot = (() => {
    const token = process.env.BOT_TOKEN

    if (token === undefined || token.length === 0) {
        log('Please provide BOT_TOKEN in env')
        process.exit(1)
    }

    return new TelegramBot(token, {
        polling: true,
    })
})()

bot.onText(/^\/start(\s.*)?$/, async msg => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).welcome())
})

bot.onText(/^\/help(\s.*)?$/, async msg => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).help())
})

bot.onText(/^\/report(\s.*)?$/, async msg => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).report())
})

bot.onText(/^(?!\/).*$/, async msg => {
    const msgText = msg.text
    const chatId = msg.chat.id
    const languageCode = msg.from.language_code

    const dialogue = i18n(languageCode)
    const reply = async (text: string) => {
        await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' })
    }

    if (msgText === undefined) {
        return
    }

    const jikeUrls = (msg.text.match(/\bhttps?:\/\/\S+/gi) || [])
        .map((it: string) => JikeUrlParser.parser(it))
        .filter((it: JikeUrl | null) => it !== null)
        .reduce((arr: JikeUrl[], v: JikeUrl): JikeUrl[] => arr.concat(v), [])
    if (jikeUrls.length === 0) {
        await reply(dialogue.notFoundJikeUrl())
        return
    }
    jikeUrls.forEach(async jikeUrl => {
        // const resultMessage = await reply('handle ' + JikeUrlParser.generateMessageUrl(it))
        const post = await JikeApi.getPostByUrl(jikeUrl)
        if (post === null || post.data === undefined) {
            await reply(dialogue.fail())
            return
        }

        log(post)

        const content = trim`
        #${noSpace`${post.data.topic.content}`}
        ${post.data.content}

        [${dialogue.originalLink()}](${JikeUrlParser.generateMessageUrl(jikeUrl)})
        `

        const video = (post => {
            if (post.data.video) {
                return post.data.video
            }
            if (post.data.linkInfo) {
                return post.data.linkInfo.video
            }
        })(post)

        if (post.data.pictures !== undefined && post.data.pictures.length > 0) {
            await bot.sendMediaGroup(
                chatId,
                post.data.pictures.map((it, index) => {
                    return {
                        type: 'photo',
                        media: it.picUrl,
                        caption: index === 0
                            ? content
                            : undefined,
                        parse_mode: 'Markdown',
                    } as InputMediaPhoto
                }),
            )
        } else if (video !== undefined) {
            const mediaMeta = await JikeApi.getMediaMeta(jikeUrl)
            if (mediaMeta === null) {
                await reply(dialogue.fail())
                return
            }
            const fileName = `${post.data.id}.mp4`
            await m3u8ToMp4Converter.setInputFile(mediaMeta.url)
                .setOutputFile(fileName)
                .start()
            await bot.sendVideo(
                chatId,
                fs.createReadStream(fileName),
                {
                    caption: content,
                    // @ts-ignore
                    parse_mode: 'Markdown',
                },
            )
        } else {
            await reply(content)
        }
    })
})

bot.on('message', async msg => {
    log(msg)
})

log('bot is ready')
