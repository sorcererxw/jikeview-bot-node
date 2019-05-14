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
    middlePicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/1000x2000%3E/quality/70/interlace/1
    picUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/202840@
    smallPicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/400x2000%3E/quality/70/interlace/1
    thumbnailUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/300x2000%3E/quality/70/interlace/1
    watermarkPicUrl?: string, // https://cdn.ruguoapp.com/FlB30KmHjL_vVPjfXnJ_AAMVpK_z.jpg?imageMogr2/auto-orient/thumbnail/202840@%7Cwatermark/3/image/aHR0cHM6Ly93YXRlcm1hcmsuamlrZS5ydWd1b2FwcC5jb20vP3RleHQ9JUU1JThEJUIzJUU1JTg4JUJCJTIwJTQwJUU2JTk2JTk3JUU1JTlCJUJFJUU4JThGJThDJmhlaWdodD0yMg==/gravity/SouthEast/dx/10/dy/10
    width?: number // 440
}

interface PostTopic {
    content: string
}

interface LinkInfo {
    linkUrl?: string, // http://video.weibo.com/show?fid=1034:4331341232195357
    pictureUrl?: string, // https://pic-txcdn.ruguoapp.com/Fr71UsUFLBR8f_DQXYaeS2G5Se3d?imageMogr2/auto-orient/heic-exif/1/format/jpeg?imageView2/0/w/160/h/160/q/80
    source?: string, // 查看链接
    title?: string, // 2018年最令人震撼的魔术表演  ​
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
    url?: string // https://media-qncdn.ruguoapp.com/295e5f68641b12c7b74808d21e0008834226ea314c38b9135ca9e09dcab6a675-5c55a5423ae83817fca78bb4.m3u8
}
