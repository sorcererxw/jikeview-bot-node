package com.sorcererxw.jikeview.bot

<<<<<<< HEAD
import com.sorcererxw.jikeview.jike.JikeClient
import com.sorcererxw.jikeview.jike.JikeUrlParser
import com.sorcererxw.jikeview.jike.JikeVideoDownloader
import com.sorcererxw.jikeview.jike.PostType
import com.sorcererxw.jikeview.jike.entity.Post
=======
>>>>>>> use thread pool to handle requests
import com.sorcererxw.jikeview.util.StringUtil
import org.springframework.stereotype.Component
import org.telegram.telegrambots.bots.DefaultBotOptions
import org.telegram.telegrambots.bots.TelegramLongPollingBot
import org.telegram.telegrambots.meta.ApiContext
<<<<<<< HEAD
import org.telegram.telegrambots.meta.api.methods.send.SendMediaGroup
import org.telegram.telegrambots.meta.api.methods.send.SendMessage
import org.telegram.telegrambots.meta.api.methods.send.SendVideo
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageText
import org.telegram.telegrambots.meta.api.objects.InputFile
import org.telegram.telegrambots.meta.api.objects.Message
import org.telegram.telegrambots.meta.api.objects.Update
import org.telegram.telegrambots.meta.api.objects.media.InputMedia
import org.telegram.telegrambots.meta.api.objects.media.InputMediaPhoto
import org.telegram.telegrambots.meta.api.objects.media.InputMediaVideo
import java.io.File
=======
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery
import org.telegram.telegrambots.meta.api.methods.send.SendMessage
import org.telegram.telegrambots.meta.api.objects.CallbackQuery
import org.telegram.telegrambots.meta.api.objects.Message
import org.telegram.telegrambots.meta.api.objects.Update
import java.net.InetAddress
import java.util.concurrent.Executors
>>>>>>> use thread pool to handle requests

/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
@Component
class JikeViewBot : TelegramLongPollingBot(DEFAULT_OPTION) {
    companion object {
        private val DEFAULT_OPTION = ApiContext.getInstance(DefaultBotOptions::class.java)
<<<<<<< HEAD
//                .also { it.proxyHost = "127.0.0.1" }
//                .also { it.proxyPort = 1080 }
//                .also { it.proxyType = DefaultBotOptions.ProxyType.SOCKS5 }
=======
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
>>>>>>> use thread pool to handle requests
    }

    override fun getBotUsername(): String = Config.BOT_NAME

    override fun getBotToken(): String = Config.BOT_TOKEN

    override fun onUpdateReceived(update: Update) {
<<<<<<< HEAD
        val message = update.message ?: return
=======
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
>>>>>>> use thread pool to handle requests
        if (message.isCommand) {
            if (message.text == Commands.START) {
                execute(SendMessage().setChatId(message.chatId)
                        .enableMarkdown(true)
                        .setText(Dialogues.SAY_HELLO()))
            }else if(message.text == Commands.REPORT){
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
<<<<<<< HEAD
                val progress = execute(SendMessage().setChatId(message.chatId)
                        .setText(Dialogues.PROGRESS_HANDLING_URL(url)))
                val post = JikeClient.instance.getPostByUrl(url)
                val editMessageText: EditMessageText = if (post != null) {
                    try {
                        sendPost(message, post)
                        EditMessageText().setChatId(message.chatId)
                                .setMessageId(progress.messageId)
                                .setText(Dialogues.PROGRESS_HANDEL_URL_SUCCESS(url))
                    } catch (e: Exception) {
                        EditMessageText()
                                .setChatId(message.chatId)
                                .setMessageId(progress.messageId)
                                .setText("${Dialogues.PROGRESS_HANDEL_URL_FAILED(url)}\n${e.message}")
                    }
                } else {
                    EditMessageText().setChatId(message.chatId).setMessageId(progress.messageId)
                            .setText(Dialogues.CANNOT_HANDEL_URL(url))
                }
                execute(editMessageText)
=======
                workerPool.execute(SendPostTask(
                        url = url,
                        chatId = message.chatId,
                        bot = this,
                        requestMessageId = message.messageId))
>>>>>>> use thread pool to handle requests
            }
        }
    }

<<<<<<< HEAD
    @Throws(UnsupportedOperationException::class)
    private fun sendPost(message: Message, post: Post) {
        val data = post.postData
        val type = PostType.from(data.type)
        val picture = data.pictures ?: data.pictureUrls
        val video = data.video ?: data.linkInfo?.video

        val content = generateContent(post, type)

        if (video != null) {
            val parserVideo = JikeVideoDownloader(File("temp"), video, data.id, type)
                    .download()

            val sendVideo = SendVideo()
                    .setChatId(message.chatId)
                    .enableMarkdown(true)
                    .setSupportsStreaming(true)
                    .setVideo(parserVideo.videoFile)
                    .setThumb(InputFile(parserVideo.thumbFile, parserVideo.thumbFile.name))
                    .setDuration(parserVideo.duration)
                    .setHeight(parserVideo.height)
                    .setWidth(parserVideo.width)
                    .setCaption(content)
            execute(sendVideo)
        } else if (picture != null && picture.isNotEmpty()) {

            val gallery = if (picture[0].format == "gif") picture.subList(0, 0) else picture.filter { it.format != "gif" }

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
                mediaList[0].caption = content
                mediaList[0].enableMarkdown(true)
            }
            val action = SendMediaGroup()
                    .setChatId(message.chatId)
                    .also { it.media = mediaList }
            execute(action)
        } else {
            val action = SendMessage().setChatId(message.chatId).setText(content).enableMarkdown(true)
            execute(action)
        }
    }

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

=======
>>>>>>> use thread pool to handle requests
}