import { I18n } from './index'

export class EnUs implements I18n {
    help(): string {
        return 'help'
    }

    originalLink(): string {
        return 'Original Link'
    }

    welcome(): string {
        return 'welcome'
    }

    fail = (): string => 'fail'

    notFoundJikeUrl(): string {
        return ''
    }

    report(): string {
        return ''
    }

    share(): string {
        return ''
    }
}
