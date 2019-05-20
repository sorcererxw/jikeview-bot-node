import { I18n } from './index'
import { TemplateHandlers } from '../utils/string-utils'

const { trim } = TemplateHandlers

export class EnUs implements I18n {
    help(): string {
        return trim`
        Just share Jike post link to me, and I'll reply the Telegramify content to you.

        /help show usage guide
        /report report problem
        `
    }

    originalLink(): string {
        return 'Original Link'
    }

    welcome(): string {
        return 'welcome'
    }

    fail = (): string => 'fail'

    notFoundJikeUrl(): string {
        return 'Not found Jike post url'
    }

    report = (): string =>
        trim`Any problem?
         Create issues on [Github issues](https://github.com/sorcererxw/jikeview-bot/issues)`

    share(): string {
        return 'Share'
    }
}
