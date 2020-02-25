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
import { downloadFile } from './utils/files'

const STORAGE_CHAT = config.get<string>('storageChat')
const BOT_TOKEN = config.get<string>('botToken')
const bot = new Telegraf(BOT_TOKEN)

bot.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    console.error(e)
    await ctx.reply(`${e}`)
  }
})

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
  const dialogue = i18n(ctx.from.language_code)

  const jikeUrls = (ctx.message.text.match(/\bhttps?:\/\/\S+/gi) || [])
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

    const {
      text,
      media,
    } = post

    if (media === undefined || media.length === 0) {
      await ctx.reply(text.content, {
        parse_mode: text.mode,
      })
      return
    }
    if (media.length === 1 && media[0].type === 'photo') {
      await ctx.replyWithPhoto(
        media[0].videoFile,
        {
          caption: text.content,
          parse_mode: text.mode,
        },
      )
      return
    }
    if (media.length === 1 && media[0].type === 'video') {
      const video = media[0] as TgPostVideo
      console.log(video)

      await ctx.replyWithVideo(
        { source: fs.createReadStream(video.videoFile) },
        {
          width: video.width,
          height: video.height,
          caption: text.content,
          parse_mode: text.mode,
          thumb: { source: fs.createReadStream(video.thumbFile) },
        },
      )
      fs.unlinkSync(video.videoFile)
      return
    }
    if (media.length === 1 && media[0].type === 'gif') {
      await ctx.replyWithPhoto(media[0].videoFile,
        {
          caption: text.content,
          parse_mode: text.mode,
        },
      )
      return
    }
    if (media.filter(it => it.type === 'gif').length === media.length) {
      await ctx.replyWithPhoto(
        media[0].videoFile,
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
              media: value.videoFile,
            } as InputMediaPhoto
          }
          if (value.type === 'video') {
            return {
              type: 'video',
              parse_mode: text.mode,
              caption: idx === 0 ? text.content : undefined,
              media: value.videoFile,
            } as InputMediaVideo
          }
        })
        .filter(it => it !== undefined),
    )
  }
})

async function jikePostToTgPost(jikeUrl: JikeUrl): Promise<TgPost> {
  const post = await getPostByUrl(jikeUrl)
  console.log(JSON.stringify(post, null, 2))
  if (post === null || post.data === undefined) {
    return null
  }

  const textContent = [
    ...(
      post.data.topic?.content
        ? [`#${removeSpace(removePunctuation(post.data.topic.content))}`]
        : []
    ),
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
          videoFile: it.picUrl,
        } as TgPostGif
      }
      return {
        type: 'photo',
        videoFile: it.picUrl,
      } as TgPostPhoto
    }).forEach(it => mediaArr.push(it))
  }

  if (video !== undefined) {
    const mediaMeta = await getMediaMeta(jikeUrl)
    if (mediaMeta === null) {
      return null
    }

    const videoFileName = await new Promise((resolve, reject) => {
      const fileName = `video-${post.data.id}${Date.now()}${Math.random()}.mp4`
      ffmpeg(mediaMeta.url)
        .setFfmpegPath(pathToFfmpeg)
        .on('error', error => {
          reject(new Error(error))
        })
        .on('end', () => {
          resolve(fileName)
        })
        .outputOptions('-c copy')
        .outputOptions('-bsf:a aac_adtstoasc')
        .output(fileName)
        .run()
    })

    const [thumbFileName, width, height] = await new Promise(async (resolve, reject) => {
      let thumbUrl: string | undefined
      if (video.thumbnailUrl) {
        thumbUrl = video.thumbnailUrl
      } else if (video.image && video.image.picUrl) {
        thumbUrl = video.image.picUrl
      }
      if (!thumbUrl) {
        resolve([undefined, undefined, undefined])
      }

      const fileName = await downloadFile(thumbUrl)

      const probe = require('probe-image-size')
      const result = await probe(fs.createReadStream(fileName))
      const width = result.width
      const height = result.height

      resolve([fileName, width, height])
    })

    mediaArr.push({
      type: 'video',
      videoFile: videoFileName,
      thumbFile: thumbFileName,
      width, height,
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
