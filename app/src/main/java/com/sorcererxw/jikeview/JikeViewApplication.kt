package com.sorcererxw.jikeview

import net.bramp.ffmpeg.FFmpeg
import net.bramp.ffmpeg.FFprobe
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.telegram.telegrambots.ApiContextInitializer


/**
 * @author: Sorcerer
 * @date: 1/31/2019
 * @description:
 */
@SpringBootApplication
class JikeViewApplication

fun main(args: Array<String>) {
    ApiContextInitializer.init()

    runApplication<JikeViewApplication>(*args)
}