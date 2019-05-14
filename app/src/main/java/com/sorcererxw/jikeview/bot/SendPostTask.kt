package com.sorcererxw.jikeview.bot

import com.sorcererxw.jikeview.jike.JikeClient
import com.sorcererxw.jikeview.jike.JikeUrlParser
import com.sorcererxw.jikeview.jike.JikeVideoDownloader
import com.sorcererxw.jikeview.jike.PostType
import com.sorcererxw.jikeview.jike.entity.Picture
import com.sorcererxw.jikeview.jike.entity.Post
import com.sorcererxw.jikeview.jike.entity.Video
import org.telegram.telegrambots.meta.api.methods.send.SendMediaGroup
import org.telegram.telegrambots.meta.api.methods.send.SendMessage
import org.telegram.telegrambots.meta.api.methods.send.SendVideo
import org.telegram.telegrambots.meta.api.methods.updatingmessages.DeleteMessage
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText
import org.telegram.telegrambots.meta.api.objects.InputFile
import org.telegram.telegrambots.meta.api.objects.media.InputMedia
import org.telegram.telegrambots.meta.api.objects.media.InputMediaPhoto
import org.telegram.telegrambots.meta.api.objects.media.InputMediaVideo
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton
import org.telegram.telegrambots.meta.bots.AbsSender
import java.io.File

/**
 * @author: sorcererxw
 * @date: 2019/4/28
 * @description:
 */
class SendPostTask(
        private val requestMessageId: Int,
        private val chatId: Long,
        private val url: String,
        private val bot: AbsSender
) : Runnable {

    override fun run() {
        val progress = bot.execute(
                SendMessage().setChatId(chatId)
                        .setText(Dialogues.PROGRESS_HANDLING_URL(url))
                        .setReplyToMessageId(requestMessageId)
                        .disableWebPagePreview()
        )

        val post = JikeClient.instance.getPostByUrl(url)

        if (post == null) {
            bot.execute(EditMessageText().setChatId(chatId)
                    .setMessageId(progress.messageId)
                    .setText(Dialogues.CANNOT_HANDEL_URL(url))
                    .disableWebPagePreview())
            return
        }
        try {
            sendPost(chatId, post, progress.messageId)
            bot.execute(EditMessageText().setChatId(chatId)
                    .setMessageId(progress.messageId)
                    .setText(Dialogues.PROGRESS_HANDEL_URL_SUCCESS(url))
                    .disableWebPagePreview())
        } catch (e: Exception) {
            bot.execute(DeleteMessage().setChatId(chatId).setMessageId(progress.messageId))
            bot.execute(SendMessage()
                    .setReplyToMessageId(requestMessageId)
                    .setChatId(chatId)
                    .setText("${Dialogues.PROGRESS_HANDEL_URL_FAILED(url)}\n${e.message}")
                    .disableWebPagePreview())
        }
    }


    @Throws(UnsupportedOperationException::class)
    private fun sendPost(chatId: Long, post: Post, progressId: Int) {
        val data = post.postData
        val type = PostType.from(data.type)
        val picture = data.pictures ?: data.pictureUrls
        val video = data.video ?: data.linkInfo?.video

        val content = generateContent(post, type)

        if (video != null) {
            sendVideoPost(chatId, progressId, content, video, data.id, type)
        } else if (picture != null && picture.isNotEmpty()) {
            sendMediaGroupPost(chatId, progressId, picture, content)
        } else {
            sendTextPost(chatId, progressId, content)
        }
    }

    private fun sendVideoPost(chatId: Long, progressId: Int, caption: String,
                              video: Video, postId: String, type: PostType) {
        val downloader = JikeVideoDownloader(File("temp"), video, postId, type)

        try {
            val parserVideo = downloader.download()
            val sendVideo = SendVideo()
                    .setChatId(chatId)
                    .enableMarkdown(true)
                    .setSupportsStreaming(true)
                    .setVideo(parserVideo.videoFile)
                    .setThumb(InputFile(parserVideo.thumbFile, parserVideo.thumbFile.name))
                    .setDuration(parserVideo.duration)
                    .setHeight(parserVideo.height)
                    .setWidth(parserVideo.width)
                    .setCaption(caption)
                    .setReplyToMessageId(progressId)
                    .setReplyMarkup(shareMarkup)
            bot.execute(sendVideo)
        } catch (e: Exception) {
            downloader.clear()
            throw e
        }
    }

    private fun sendMediaGroupPost(chatId: Long, progressId: Int, pictures: List<Picture>, caption: String) {
        val gallery = if (pictures[0].format == "gif") pictures.subList(0, 0) else pictures.filter { it.format != "gif" }

        val mediaList: List<InputMedia<*>> = gallery
                .filter { !it.picUrl.isNullOrEmpty() }
                .map { pic ->
                    val picUrl = pic.picUrl!!
                    return@map if (pic.format == "gif") {
                        InputMediaVideo(picUrl, "")
                    } else {
                        InputMediaPhoto(picUrl, "")
                    }
                }

        if (mediaList.isNotEmpty()) {
            mediaList[0].caption = caption
            mediaList[0].enableMarkdown(true)
        }
        val action = SendMediaGroup()
                .setChatId(chatId)
                .setReplyToMessageId(progressId)
                .also { it.media = mediaList }
        bot.execute(action)
    }

    private fun sendTextPost(chatId: Long, progressId: Int, text: String) {
        val action = SendMessage()
                .setChatId(chatId).setText(text).enableMarkdown(true)
                .setReplyToMessageId(progressId)
                .setReplyMarkup(shareMarkup)
        bot.execute(action)
    }

    private val shareMarkup = InlineKeyboardMarkup().setKeyboard(listOf(listOf(
            InlineKeyboardButton()
                    .setText(Dialogues.ACTION_SHARE())
                    .setCallbackData("https://t.me/share/url?url=12&text=12")
    )))

    private fun generateContent(post: Post, type: PostType): String {
        val data = post.postData
        val topic = post.postData.topic

        var content = ""
        if (topic != null) {
            content += "#${topic.title}\n"
        }
        content += data.content

        val link = if (!data.linkUrl.isNullOrEmpty()) {
            data.linkUrl
        } else {
            JikeUrlParser.generateMessageUrl(type, data.id)
        }

        content += "\n${Dialogues.CONTENT_ORIGINAL_LINK(link)}"

        return content
    }
}