package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

data class LinkInfo(
        @SerializedName("linkUrl")
        val linkUrl: String?, // http://video.weibo.com/show?fid=1034:4331341232195357
        @SerializedName("pictureUrl")
        val pictureUrl: String?, // https://pic-txcdn.ruguoapp.com/Fr71UsUFLBR8f_DQXYaeS2G5Se3d?imageMogr2/auto-orient/heic-exif/1/format/jpeg?imageView2/0/w/160/h/160/q/80
        @SerializedName("source")
        val source: String?, // 查看链接
        @SerializedName("title")
        val title: String?, // 2018年最令人震撼的魔术表演  ​
        @SerializedName("video")
        val video: Video?
)