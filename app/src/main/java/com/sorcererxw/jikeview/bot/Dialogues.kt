@file:Suppress("FunctionName")

package com.sorcererxw.jikeview.bot

import com.sun.org.apache.bcel.internal.generic.GOTO

/**
 * @author: Sorcerer
 * @date: 2/3/2019
 * @description:
 */
object Dialogues {
    fun PROGRESS_HANDLING_URL(url:String) = "正在处理 $url \n请稍等......"
    fun PROGRESS_HANDEL_URL_SUCCESS(url: String) = "$url 处理完成"
    fun PROGRESS_HANDEL_URL_FAILED(url: String) = "$url 处理失败"

    fun CANNOT_HANDEL_URL(url:String) ="无法处理 $url"

    fun CONTENT_ORIGINAL_LINK(link: String) = "[原始链接]($link)"

    fun NOT_FOUND_URL() = "未检测链接"

    fun UNSUPPORTED_VIDEO_TYPE() = "暂不支持此类视频"

    fun SAY_HELLO() ="✨*即刻抓取*\n" +
            "可以直接通过 *即刻 APP* 分享消息或者复制消息链接给我，我会将消息转成 Telegram 消息发送给您"

    fun GOTO_ISSUE_PAGE() = "如果发现本 Bot 有任何令您不满意的地方，请前往[本项目 Github Issues 页面](https://github.com/sorcererxw/jikeview-bot/issues)提出问题。\n" +
            "感谢您的使用和反馈"

    fun ERROR_PHOTO_TOO_LARGE() = "图片体积过大"

    fun ERROR_VIDEO_TOO_LARGE() = "视频体积过大"
}