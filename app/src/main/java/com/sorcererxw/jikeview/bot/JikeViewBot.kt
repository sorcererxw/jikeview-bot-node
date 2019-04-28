package com.sorcererxw.jikeview.bot

import com.sorcererxw.jikeview.jike.JikeClient
import com.sorcererxw.jikeview.jike.JikeUrlParser
import com.sorcererxw.jikeview.jike.JikeVideoDownloader
import com.sorcererxw.jikeview.jike.PostType
import com.sorcererxw.jikeview.jike.entity.Picture
import com.sorcererxw.jikeview.jike.entity.Post
import com.sorcererxw.jikeview.jike.entity.Video
import com.sorcererxw.jikeview.util.StringUtil
import org.springframework.stereotype.Component
import org.telegram.telegrambots.bots.DefaultBotOptions
import org.telegram.telegrambots.bots.TelegramLongPollingBot
import org.telegram.telegrambots.meta.ApiContext
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery
import org.telegram.telegrambots.meta.api.methods.send.SendMediaGroup
import org.telegram.telegrambots.meta.api.methods.send.SendMessage
import org.telegram.telegrambots.meta.api.methods.send.SendVideo
import org.telegram.telegrambots.meta.api.methods.updatingmessages.DeleteMessage
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText
import org.telegram.telegrambots.meta.api.objects.CallbackQuery
import org.telegram.telegrambots.meta.api.objects.InputFile
import org.telegram.telegrambots.meta.api.objects.Message
import org.telegram.telegrambots.meta.api.objects.Update
import org.telegram.telegrambots.meta.api.objects.media.InputMedia
import org.telegram.telegrambots.meta.api.objects.media.InputMediaPhoto
import org.telegram.telegrambots.meta.api.objects.media.InputMediaVideo
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton
import java.io.File
import java.net.InetAddress
import java.net.Socket
import java.util.concurrent.Executors


/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
@Component
class JikeViewBot : TelegramLongPollingBot(DEFAULT_OPTION) {
    companion object {
        private val DEFAULT_OPTION = ApiContext.getInstance(DefaultBotOptions::class.java)
                .also {
                    if (isAbleToAccessTelegram()) return@also
                    println("Cannot reach Telegram, setup proxy")
                    it.proxyHost = "127.0.0.1"
                    it.proxyPort = 1080
                    it.proxyType = DefaultBotOptions.ProxyType.SOCKS5
                }

        private fun isAbleToAccessTelegram(): Boolean {
            return try {
                val address = InetAddress.getByName("api.telegram.org")
                val reachable = address.isReachable(10000)
                println("Is Telegram reachable? $reachable")
                reachable
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        private fun isAddressAvailable(address: String, port: Int): Boolean {
            return try {
                Socket(address, port)
                true
            } catch (e: Exception) {
                false
            }
        }
    }

    override fun getBotUsername(): String = Config.BOT_NAME

    override fun getBotToken(): String = Config.BOT_TOKEN

    override fun onUpdateReceived(update: Update) {

        if (update.hasCallbackQuery()) {
            handleCallback(update.callbackQuery)
        } else if (update.hasMessage()) {
            handleUpdateMessage(update.message)
        }
    }

    private val workerPool = Executors.newCachedThreadPool()

    private fun handleCallback(callbackQuery: CallbackQuery) {
        println(callbackQuery)
        val message = callbackQuery.message
//        execute(ForwardMessage()
//                .setFromChatId(message.chatId)
//                .setMessageId(message.messageId))
        execute(AnswerCallbackQuery()
                .setCallbackQueryId(callbackQuery.id))
    }

    private fun handleUpdateMessage(message: Message) {
        if (message.isCommand) {
            if (message.text == Commands.START) {
                execute(SendMessage().setChatId(message.chatId)
                        .enableMarkdown(true)
                        .setText(Dialogues.SAY_HELLO()))
            } else if (message.text == Commands.REPORT) {
                execute(SendMessage().setChatId(message.chatId)
                        .enableMarkdown(true)
                        .setText(Dialogues.GOTO_ISSUE_PAGE()))
            }
        } else {
            val urls = StringUtil.extractUrls(message.text)
            if (urls.isEmpty()) {
                execute(SendMessage().setChatId(message.chatId)
                        .setReplyToMessageId(message.messageId)
                        .setText(Dialogues.NOT_FOUND_URL()))
                return
            }
            urls.forEach { url ->
                val progress = execute(
                        SendMessage().setChatId(message.chatId)
                                .setText(Dialogues.PROGRESS_HANDLING_URL(url))
                                .setReplyToMessageId(message.messageId)
                                .disableWebPagePreview()
                )
                workerPool.execute {
                    val post = JikeClient.instance.getPostByUrl(url)

                    if (post == null) {
                        execute(EditMessageText().setChatId(message.chatId)
                                .setMessageId(progress.messageId)
                                .setText(Dialogues.CANNOT_HANDEL_URL(url))
                                .disableWebPagePreview())
                        return@execute
                    }
                    try {
                        sendPost(message.chatId, post, progress.messageId)
                        execute(EditMessageText().setChatId(message.chatId)
                                .setMessageId(progress.messageId)
                                .setText(Dialogues.PROGRESS_HANDEL_URL_SUCCESS(url))
                                .disableWebPagePreview())
                    } catch (e: Exception) {
                        execute(DeleteMessage().setChatId(message.chatId).setMessageId(progress.messageId))
                        execute(SendMessage()
                                .setReplyToMessageId(message.messageId)
                                .setChatId(message.chatId)
                                .setText("${Dialogues.PROGRESS_HANDEL_URL_FAILED(url)}\n${e.message}")
                                .disableWebPagePreview())
                    }
                }
            }
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
            execute(sendVideo)
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
        execute(action)
    }

    private fun sendTextPost(chatId: Long, progressId: Int, text: String) {
        val action = SendMessage()
                .setChatId(chatId).setText(text).enableMarkdown(true)
                .setReplyToMessageId(progressId)
                .setReplyMarkup(shareMarkup)
        execute(action)
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