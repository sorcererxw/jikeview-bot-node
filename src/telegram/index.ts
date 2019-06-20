import TelegramBot, { InputMediaPhoto, InputMediaVideo } from 'node-telegram-bot-api'
import { log } from '../utils/logger'
import config from 'config'
import { TgPost, TgPostVideo } from './types'

const BOT_TOKEN = config.get<string>('bot_token')
console.log(`BOT_TOKEN: ${BOT_TOKEN}`)

function createBot(): TelegramBot | null {
    return (() => {
        if (!BOT_TOKEN) {
            log('Please provide BOT_TOKEN in config')
            return null
        }

        return new TelegramBot(BOT_TOKEN, {
            polling: true,
            webHook: false,
        })
    })()
}

async function sendTgPost(bot: TelegramBot, chatId: number, post: TgPost) {
    console.log(post)

    const { text, media } = post

    if (media === undefined || media.length === 0) {
        await bot.sendMessage(chatId, text.content, {
            parse_mode: text.mode,
        })
        return
    }
    if (media.length === 1 && media[0].type === 'photo') {
        await bot.sendPhoto(chatId, media[0].file, {
            caption: text.content,
            // @ts-ignore
            parse_mode: text.mode,
        })
        return
    }
    if (media.length === 1 && media[0].type === 'video') {
        const video = media[0] as TgPostVideo

        let width: number | undefined
        let height: number | undefined

        if (video.thumbUrl) {
            const probe = require('probe-image-size')
            const result = await probe(video.thumbUrl)
            width = result.width
            height = result.height
        }
        console.log(`
        width: ${width}
        height: ${height}
        `)
        await bot.sendVideo(chatId, media[0].file, {
            width,
            height,
            caption: text.content,
            // @ts-ignore
            parse_mode: text.mode,
            thumb: video.thumbUrl,
        })
        return
    }
    if (media.length === 1 && media[0].type === 'gif') {
        await bot.sendPhoto(chatId, media[0].file, {
            caption: text.content,
            // @ts-ignore
            parse_mode: text.mode,
        })
        return
    }
    if (media.filter(it => it.type === 'gif').length === media.length) {
        await bot.sendPhoto(chatId, media[0].file, {
            caption: text.content,
            // @ts-ignore
            parse_mode: text.mode,
        })
        return
    }
    await bot.sendMediaGroup(
        chatId,
        media.filter(it => it.type !== 'gif')
            .map((value, idx) => {
                if (value.type === 'photo') {
                    return {
                        type: 'photo',
                        parse_mode: text.mode,
                        caption: idx === 0 ? text.content : undefined,
                        media: value.file,
                    } as InputMediaPhoto
                }
                if (value.type === 'video') {
                    return {
                        type: 'video',
                        parse_mode: text.mode,
                        caption: idx === 0 ? text.content : undefined,
                        media: value.file,
                    } as InputMediaVideo
                }
            })
            .filter(it => it !== undefined),
    )
}

export * from './types'

export {
    createBot,
    sendTgPost,
}
