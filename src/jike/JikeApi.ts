import {JikeUrl, JikeUrlType} from "./JikeUrlParser";

const fetch = require("node-fetch")

const baseUrl = 'https://app.jike.ruguoapp.com/1.0';

function get<T>(url: string): Promise<T> {
    return fetch(`${baseUrl}${url}`,
        {
            headers: {'content-type': 'application/json;charset=UTF-8'},
            method: 'GET',
        }
    ).then((res: any) => res.json() as T)
}

async function getOriginalPosts(id: string): Promise<Post> {
    return await get(`/originalPosts/get?id=${id}`)
}

async function getOfficialMessages(id: string): Promise<Post> {
    return await get(`/officialMessages/get?id=${id}`)
}

async function getMediaMeta(id: string, type: string): Promise<MediaMeta> {
    return await get(`/mediaMeta/play?id=${id}&type=${type}`)
}


export default class JikeApi {
    static async getPostByUrl(url: JikeUrl): Promise<Post | null> {
        console.log(url);
        if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
            return await getOfficialMessages(url.id)
        } else if (url.type === JikeUrlType.ORIGINAL_POST) {
            return await getOriginalPosts(url.id)
        }
        return null;
    }

    static async getMediaMeta(url: JikeUrl): Promise<MediaMeta | null> {
        if (url.type === JikeUrlType.ORIGINAL_POST) {
            return await getMediaMeta(url.id, 'ORIGINAL_POST')
        } else if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
            return await getMediaMeta(url.id, 'OFFICIAL_MESSAGE')
        }
        return null
    }
}
