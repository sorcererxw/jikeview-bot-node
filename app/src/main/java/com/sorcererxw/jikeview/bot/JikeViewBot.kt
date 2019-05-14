package com.sorcererxw.jikeview.bot

import com.sorcererxw.jikeview.util.StringUtil
import org.springframework.stereotype.Component
import org.telegram.telegrambots.bots.DefaultBotOptions
import org.telegram.telegrambots.bots.TelegramLongPollingBot
import org.telegram.telegrambots.meta.ApiContext
import org.telegram.telegrambots.meta.api.methods.AnswerCallbackQuery
import org.telegram.telegrambots.meta.api.methods.send.SendMessage
import org.telegram.telegrambots.meta.api.objects.CallbackQuery
import org.telegram.telegrambots.meta.api.objects.Message
import org.telegram.telegrambots.meta.api.objects.Update
import java.net.InetAddress
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
                workerPool.execute(SendPostTask(
                        url = url,
                        chatId = message.chatId,
                        bot = this,
                        requestMessageId = message.messageId))
            }
        }
    }

}