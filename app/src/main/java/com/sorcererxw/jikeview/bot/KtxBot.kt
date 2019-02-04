package com.sorcererxw.jikeview.bot

import org.telegram.telegrambots.meta.api.methods.ParseMode
import org.telegram.telegrambots.meta.api.methods.send.SendVideo
import org.telegram.telegrambots.meta.api.objects.media.InputMedia

/**
 * @author: Sorcerer
 * @date: 2/4/2019
 * @description:
 */
fun SendVideo.enableMarkdown(enable: Boolean): SendVideo {
    if (enable) {
        this.parseMode = ParseMode.MARKDOWN
    } else {
        this.parseMode = null
    }
    return this
}

fun <T> InputMedia<T>.enableMarkdown(enable: Boolean): InputMedia<T> {
    if (enable) {
        this.parseMode = ParseMode.MARKDOWN
    } else {
        this.parseMode = null
    }
    return this
}