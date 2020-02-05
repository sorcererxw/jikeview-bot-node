import { ParseMode } from 'telegraf/typings/telegram-types'

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
