package com.sorcererxw.jikeview.jike.entity

import com.google.gson.annotations.SerializedName

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
data class UrlContent(
        @SerializedName("originalUrl") val originalUrl: String, // http://t.cn/EtoRw3B
        @SerializedName("title") val title: String, // t.cn
        @SerializedName("url") val url: String // https://redirect.jike.ruguoapp.com?redirect=http%3A%2F%2Ft.cn%2FEtoRw3B
)