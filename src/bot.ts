import { i18n } from './i18n'
import { removePunctuation, removeSpace } from './utils/strings'
import * as ffmpeg from 'fluent-ffmpeg'
import * as pathToFfmpeg from 'ffmpeg-static'
import * as fs from 'fs'
import * as config from 'config'
import Telegraf from 'telegraf'
import { getMediaMeta, getPostByUrl, JikeUrl, parser } from './jike'
import { TgPost, TgPostGif, TgPostPhoto, TgPostVideo } from './telegram'
import { InputMediaPhoto, InputMediaVideo } from 'telegraf/typings/telegram-types'
import { commands } from './commands'

const STORAGE_CHAT = config.get<string>('storageChat')
const BOT_TOKEN = config.get<string>('botToken')
const bot = new Telegraf(BOT_TOKEN)

bot.command(commands.START.cmd, async ctx => {
  return ctx.reply(
    i18n(ctx.from.language_code).welcome(),
    { parse_mode: 'HTML' },
  )
})

bot.command(commands.HELP.cmd, async ctx => {
  return ctx.reply(
    i18n(ctx.from.language_code).help(),
    { parse_mode: 'HTML' },
  )
})

bot.hears(/.*/, async ctx => {
  const msgText = ctx.message.text

  const dialogue = i18n(ctx.from.language_code)

  const jikeUrls = (msgText.match(/\bhttps?:\/\/\S+/gi) || [])
    .map((it: string) => parser(it))
    .filter((it: JikeUrl | null) => it !== null)
    .reduce((arr: JikeUrl[], v: JikeUrl): JikeUrl[] => arr.concat(v), [])
  if (jikeUrls.length === 0) {
    await ctx.reply(dialogue.notFoundJikeUrl(), { parse_mode: 'HTML' })
    return
  }
  for (const jikeUrl of jikeUrls) {
    const post = await jikePostToTgPost(jikeUrl)
    if (post === null) {
      await ctx.reply('fail', { parse_mode: 'HTML' })
      return
    }
    console.log(post)

    const { text, media } = post

    if (media === undefined || media.length === 0) {
      await ctx.reply(text.content, {
        parse_mode: text.mode,
      })
      return
    }
    if (media.length === 1 && media[0].type === 'photo') {
      await ctx.replyWithPhoto(
        media[0].file,
        {
          caption: text.content,
          parse_mode: text.mode,
        },
      )
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
      await ctx.replyWithVideo(
        media[0].file,
        {
          width,
          height,
          caption: text.content,
          parse_mode: text.mode,
          thumb: video.thumbUrl,
        },
      )
      return
    }
    if (media.length === 1 && media[0].type === 'gif') {
      await ctx.replyWithPhoto(media[0].file,
        {
          caption: text.content,
          parse_mode: text.mode,
        },
      )
      return
    }
    if (media.filter(it => it.type === 'gif').length === media.length) {
      await ctx.replyWithPhoto(
        media[0].file,
        {
          caption: text.content,
          parse_mode: text.mode,
        },
      )
      return
    }
    await ctx.replyWithMediaGroup(
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
})

async function jikePostToTgPost(jikeUrl: JikeUrl): Promise<TgPost> {
  const post = await getPostByUrl(jikeUrl)
  if (post === null || post.data === undefined) {
    return null
  }
  const textContent = [
    `#${removeSpace(removePunctuation(post.data.topic.content))}`,
    `${post.data.content}`,
  ].join('\n')


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
    const mediaMeta = await getMediaMeta(jikeUrl)
    if (mediaMeta === null) {
      return null
    }
    const fileName = `${post.data.id}${Date.now()}${Math.random()}.mp4`

    await new Promise((resolve, reject) => {
      ffmpeg(mediaMeta.url)
        .setFfmpegPath(pathToFfmpeg)
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

    const storageMsg = await bot.telegram.sendVideo(
      STORAGE_CHAT,
      { source: fs.createReadStream(fileName) },
    )
    fs.unlinkSync(fileName)

    let thumb: string | undefined
    if (video.thumbnailUrl) {
      thumb = video.thumbnailUrl
    } else if (video.image && video.image.picUrl) {
      thumb = video.image.picUrl
    }

    mediaArr.push({
      type: 'video',
      file: storageMsg.video.file_id,
      thumbUrl: thumb,
    } as TgPostVideo)
  }

  return {
    text: {
      content: textContent,
      mode: 'HTML',
    },
    media: mediaArr,
  }
}

export { bot }
