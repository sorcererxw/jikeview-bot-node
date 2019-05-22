import TelegramBot, { InputMediaPhoto, InputMediaVideo, ParseMode } from 'node-telegram-bot-api'
import { log } from '../utils/logger'

export function createBot(): TelegramBot | null {
    return (() => {
        const token = process.env.BOT_TOKEN

        if (token === undefined || token.length === 0) {
            log('Please provide BOT_TOKEN in env')
            return null
        }

        return new TelegramBot(token, {
            polling: true,
        })
    })()
}

type FileId = string
type Url = string

export interface TgPostVideo {
    type: 'video'
    file: FileId | Url,
    thumbUrl?: string
}

export interface TgPostPhoto {
    type: 'photo'
    file: FileId | Url,
}

export interface TgPostGif {
    type: 'gif'
    file: FileId | Url,
}

export interface TgPost {
    text: {
        content: string,
        mode?: ParseMode
    }
    media?: (TgPostVideo | TgPostGif | TgPostPhoto)[]
}

export async function sendTgPost(bot: TelegramBot, chatId: number, post: TgPost) {
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
        await bot.sendVideo(chatId, media[0].file, {
            caption: text.content,
            // @ts-ignore
            parse_mode: text.mode,
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
