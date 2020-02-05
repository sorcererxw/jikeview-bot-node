import { JikeUrl, JikeUrlType } from './jike-url-parser'
import Got from 'got'
import { JikePost, MediaMeta } from './jike-types'

const BASE_URL = 'https://api.jellow.club/1.0'

async function get<T>(url: string): Promise<T> {
  return Got(`${BASE_URL}${url}`,
    {
      method: 'GET',
    },
  ).json<T>()
}

async function getOriginalPosts(id: string): Promise<JikePost> {
  return get(`/originalPosts/get?id=${id}`)
}

async function getOfficialMessages(id: string): Promise<JikePost> {
  return get(`/officialMessages/get?id=${id}`)
}

async function _getMediaMeta(id: string, type: string): Promise<MediaMeta> {
  return get(`/mediaMeta/play?id=${id}&type=${type}`)
}

export async function getPostByUrl(url: JikeUrl): Promise<JikePost | null> {
  console.log(url)
  if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
    return getOfficialMessages(url.id)
  }
  if (url.type === JikeUrlType.ORIGINAL_POST) {
    return getOriginalPosts(url.id)
  }
  return null
}

export async function getMediaMeta(url: JikeUrl): Promise<MediaMeta | null> {
  if (url.type === JikeUrlType.ORIGINAL_POST) {
    return _getMediaMeta(url.id, 'ORIGINAL_POST')
  }
  if (url.type === JikeUrlType.OFFICIAL_MESSAGE) {
    return _getMediaMeta(url.id, 'OFFICIAL_MESSAGE')
  }
  return null
}
