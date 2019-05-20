import JikeUrlParser, { JikeUrl } from './jike/jike-url-parser'
import JikeApi from './jike/jike-api'
import TelegramBot, { InputMediaPhoto, InputMediaVideo, ParseMode } from 'node-telegram-bot-api'
import { I18n, i18n } from './i18n'
import { log } from './utils/logger'
import { removePunctuation, removeSpace, trimEachLine } from './utils/string-utils'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from 'ffmpeg-static'
import * as fs from 'fs'

const STORAGE_CHAT = process.env.STORAGE_CHAT

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
    await bot.sendMessage(
        chatId,
        i18n(msg.from.language_code).welcome(),
        { parse_mode: 'Markdown' },
    )
})

bot.onText(/^\/help(\s.*)?$/, async msg => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).help(), { parse_mode: 'Markdown' })
})

bot.onText(/^\/report(\s.*)?$/, async msg => {
    const chatId = msg.chat.id
    await bot.sendMessage(chatId, i18n(msg.from.language_code).report(), { parse_mode: 'Markdown' })
})

bot.onText(/^(?!\/)(.|\n)*$/, async msg => {
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
        const tgPost = await jikePostToTgPost(jikeUrl, dialogue)
        if (tgPost === null) {
            await reply('fail')
            return
        }
        await sendTgPost(chatId, tgPost)
    })
})

async function jikePostToTgPost(jikeUrl: JikeUrl, dialogue: I18n): Promise<TgPost> {
    // const resultMessage = await reply('handle ' + JikeUrlParser.generateMessageUrl(it))
    const post = await JikeApi.getPostByUrl(jikeUrl)
    if (post === null || post.data === undefined) {
        return null
    }
    const textContent = trimEachLine(`
        #${removeSpace(removePunctuation(post.data.topic.content))}
        ${post.data.content}

        [${dialogue.originalLink()}](${JikeUrlParser.generateMessageUrl(jikeUrl)})
        `)

    const pictures = (post => {
        if (post.data.pictures !== undefined && post.data.pictures.length > 0) {
            return post.data.pictures
        }
        return post.data.pictureUrls
    })(post)
    const video = (post => {
        if (post.data.video) {
            return post.data.video
        }
        if (post.data.linkInfo) {
            return post.data.linkInfo.video
        }
    })(post)

    const mediaArr: (TgPostVideo | TgPostGif | TgPostPhoto)[] = []
    if (pictures !== undefined) {
        pictures.map(it => {
            if (it.format === 'gif') {
                return {
                    type: 'gif',
                    file: it.picUrl,
                } as TgPostGif
            }
            return {
                type: 'photo',
                file: it.picUrl,
            } as TgPostPhoto
        }).forEach(it => mediaArr.push(it))
    }

    if (video !== undefined) {
        const mediaMeta = await JikeApi.getMediaMeta(jikeUrl)
        if (mediaMeta === null) {
            return null
        }
        const fileName = `${post.data.id}${Date.now()}${Math.random()}.mp4`

        await new Promise((resolve, reject) => {
            ffmpeg(mediaMeta.url)
                .setFfmpegPath(ffmpegPath)
                .on('error', error => {
                    reject(new Error(error))
                })
                .on('end', () => {
                    resolve()
                })
                .outputOptions('-c copy')
                .outputOptions('-bsf:a aac_adtstoasc')
                .output(fileName)
                .run()
        })
        const storageMsg = await bot.sendVideo(STORAGE_CHAT, fs.createReadStream(fileName))
        fs.unlinkSync(fileName)
        mediaArr.push({
            type: 'video',
            file: storageMsg.video.file_id,
            thumbUrl: video.thumbnailUrl,
        } as TgPostVideo)
    }

    return {
        text: {
            content: textContent,
            mode: 'Markdown',
        },
        media: mediaArr,
    }
}

bot.on('message', async msg => {
    log(msg)
})

type FileId = string
type Url = string

interface TgPostVideo {
    type: 'video'
    file: FileId | Url,
    thumbUrl?: string
}

interface TgPostPhoto {
    type: 'photo'
    file: FileId | Url,
}

interface TgPostGif {
    type: 'gif'
    file: FileId | Url,
}

interface TgPost {
    text: {
        content: string,
        mode?: ParseMode
    }
    media?: (TgPostVideo | TgPostGif | TgPostPhoto)[]
}

async function sendTgPost(chatId: number, post: TgPost) {
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

log('bot is ready')
