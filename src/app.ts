import JikeUrlParser, { JikeUrl } from './jike/jike-url-parser'
import JikeApi from './jike/jike-api'
import { I18n, i18n } from './i18n'
import { log } from './utils/logger'
import { removePunctuation, removeSpace, trimEachLine } from './utils/string-utils'
import ffmpeg from 'fluent-ffmpeg'
import { path as ffmpegPath } from 'ffmpeg-static'
import * as fs from 'fs'
import { createBot, sendTgPost, TgPost, TgPostGif, TgPostPhoto, TgPostVideo } from './telegram'
import config from 'config'

const STORAGE_CHAT = config.get<string>('storage_chat')

const bot = createBot()
if (bot === null) {
    process.exit(1)
}

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
        await sendTgPost(bot, chatId, tgPost)
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

log('bot is ready')
