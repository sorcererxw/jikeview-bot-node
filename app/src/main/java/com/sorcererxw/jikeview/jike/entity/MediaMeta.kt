package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

data class MediaMeta(
        @SerializedName("mediaLink")
        val mediaLink: String?, // https://www.instagram.com/p/BtYclm5govz/?isVideo=true
        @SerializedName("url")
        val url: String? // https://media-qncdn.ruguoapp.com/295e5f68641b12c7b74808d21e0008834226ea314c38b9135ca9e09dcab6a675-5c55a5423ae83817fca78bb4.m3u8
)