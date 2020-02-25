import { ParseMode } from 'telegraf/typings/telegram-types'

type FileId = string
type Url = string

export interface TgPostVideo {
  type: 'video'
  videoFile: string,
  thumbFile?: string
  width?: number,
  height?: number
}

export interface TgPostPhoto {
  type: 'photo'
  videoFile: FileId | Url,
}

export interface TgPostGif {
  type: 'gif'
  videoFile: FileId | Url,
}

export interface TgPost {
  text: {
    content: string,
    mode?: ParseMode
  }
  media?: (TgPostVideo | TgPostGif | TgPostPhoto)[]
}
