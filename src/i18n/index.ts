import { ZhHans } from './zh-hans'
import { EnUs } from './en-us'

export interface I18n {
  welcome(): string,

  help(): string,

  originalLink(): string

  fail(): string

  notFoundJikeUrl(): string

  share(): string
}

const zhHans = new ZhHans()
const enUs = new EnUs()

export function i18n(languageCode: String): I18n {
  if (!languageCode) {
    return enUs
  }
  const [lang] = languageCode.split('-')
  if (lang === 'zh') {
    return zhHans
  }
  return enUs
}
