export enum JikeUrlType {
    ORIGINAL_POST = "ORIGINAL_POST",
    OFFICIAL_MESSAGE = "OFFICIAL_MESSAGE"
}

export interface JikeUrl {
    type: JikeUrlType,
    id: string
}

const WEB_ORIGINAL_POST = /^(https?:\/\/)?web\.okjike\.com\/post-detail\/([0-9a-z]+)\/originalPost(\?.*)?$/;
const WEB_OFFICIAL_MESSAGE = /^(https?:\/\/)?web\.okjike\.com\/message-detail\/([0-9a-z]+)\/officialMessage(\?.*)?$/;
const MOBILE_ORIGINAL_POST = /^(https?:\/\/)?m\.okjike\.com\/originalPosts\/([0-9a-z]+)(\?.*)?$/;
const MOBILE_OFFICIAL_MESSAGE = /^(https?:\/\/)?m\.okjike\.com\/officialMessages\/([0-9a-z]+)(\?.*)?$/.compile();

export default class JikeUrlParser {
    static parser(url: string): JikeUrl | null {
        if (WEB_ORIGINAL_POST.test(url)) {
            return {
                type: JikeUrlType.ORIGINAL_POST,
                id: WEB_ORIGINAL_POST.exec(url)[2]
            }
        } else if (WEB_OFFICIAL_MESSAGE.test(url)) {
            return {
                type: JikeUrlType.OFFICIAL_MESSAGE,
                id: WEB_OFFICIAL_MESSAGE.exec(url)[2]
            }
        } else if (MOBILE_ORIGINAL_POST.test(url)) {
            return {
                type: JikeUrlType.ORIGINAL_POST,
                id: MOBILE_ORIGINAL_POST.exec(url)[2]
            }
        } else if (MOBILE_OFFICIAL_MESSAGE.test(url)) {
            return {
                type: JikeUrlType.OFFICIAL_MESSAGE,
                id: MOBILE_OFFICIAL_MESSAGE.exec(url)[2]
            }
        }
        return null
    }

    static generateMessageUrl(jikeUrl: JikeUrl): string {
        if (jikeUrl.type === JikeUrlType.OFFICIAL_MESSAGE) {
            return `https://web.okjike.com/message-detail/${jikeUrl.id}/officialMessage`
        } else if (jikeUrl.type === JikeUrlType.ORIGINAL_POST) {
            return `https://web.okjike.com/post-detail/${jikeUrl.id}/originalPost`
        }
        return ""
    }
}
