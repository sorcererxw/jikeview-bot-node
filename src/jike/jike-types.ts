interface Post {
    data: PostData
}

interface PostData {
    id: string,
    type?: string,
    content: string,
    urlsInText: UrlContent[],
    status: string,
    pictures?: Picture[],
    pictureUrls?: Picture[],
    createdAt: string,
    messageId: string,
    topic?: PostTopic,
    linkUrl?: string,
    video?: Video,
    linkInfo?: LinkInfo
}

interface Picture {
    cropperPosX?: number, // 0.5
    cropperPosY?: number, // 0.5
    format?: string, // jpeg
    height?: number, // 461
    middlePicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg
    picUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg
    smallPicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg
    thumbnailUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg
    watermarkPicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg
    width?: number // 440
}

interface PostTopic {
    content: string
}

interface LinkInfo {
    linkUrl?: string, // http://video.weibo.com/show?fid=1034:4331341232195357
    pictureUrl?: string, // https://pic-txcdn.ruguoapp.com/Fr71UsUFLBR8f_DQXYaeS2G5Se3d
    source?: string, // 查看链接
    title?: string, // 2018年最令人震撼的魔术表演
    video?: Video
}

interface UrlContent {
    originalUrl: string, // http://t.cn/EtoRw3B
    title: string, // t.cn
    url: string // https://redirect.jike.ruguoapp.com?redirect=http%3A%2F%2Ft.cn%2FEtoRw3B
}

interface Video {
    duration?: number,
    source?: any[],
    thumbnailUrl?: string,
    type?: string
}

interface MediaMeta {
    mediaLink?: string, // https://www.instagram.com/p/BtYclm5govz/?isVideo=true
    url?: string // https://media-qncdn.ruguoapp.com/295e5f686-41b12.m3u8
}
