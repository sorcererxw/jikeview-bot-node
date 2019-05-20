import { JikeUrl, JikeUrlType } from './jike-url-parser'

import fetch from 'node-fetch'

const BASE_URL = 'https://app.jike.ruguoapp.com/1.0'

async function get<T>(url: string): Promise<T> {
    return fetch(`${BASE_URL}${url}`,
        {
            headers: { 'content-type': 'application/json;charset=UTF-8' },
            method: 'GET',
        },
    ).then((res: any) => res.json() as T)
}

async function getOriginalPosts(id: string): Promise<JikePost> {
    return get(`/originalPosts/get?id=${id}`)
}

async function getOfficialMessages(id: string): Promise<JikePost> {
    return get(`/officialMessages/get?id=${id}`)
}

async function getMediaMeta(id: string, type: string): Promise<MediaMeta> {
    return get(`/mediaMeta/play?id=${id}&type=${type}`)
}

export default {
    async getPostByUrl(url: JikeUrl): Promise<JikePost | null> {
        console.log(url)
        if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
            return getOfficialMessages(url.id)
        }
        if (url.type === JikeUrlType.ORIGINAL_POST) {
            return getOriginalPosts(url.id)
        }
        return null
    },
    async getMediaMeta(url: JikeUrl): Promise<MediaMeta | null> {
        if (url.type === JikeUrlType.ORIGINAL_POST) {
            return getMediaMeta(url.id, 'ORIGINAL_POST')
        }
        if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
            return getMediaMeta(url.id, 'OFFICIAL_MESSAGE')
        }
        return null
    },
}
