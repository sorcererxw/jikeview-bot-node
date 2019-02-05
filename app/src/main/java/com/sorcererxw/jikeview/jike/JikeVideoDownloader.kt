package com.sorcererxw.jikeview.jike

import com.iheartradio.m3u8.Encoding
import com.iheartradio.m3u8.Format
import com.iheartradio.m3u8.ParsingMode
import com.iheartradio.m3u8.PlaylistParser
import com.iheartradio.m3u8.data.Playlist
import com.sorcererxw.jikeview.bot.Dialogues
import com.sorcererxw.jikeview.jike.entity.Video
import net.bramp.ffmpeg.FFmpeg
import net.bramp.ffmpeg.FFmpegExecutor
import net.bramp.ffmpeg.FFprobe
import net.bramp.ffmpeg.builder.FFmpegBuilder
import org.apache.commons.io.FileUtils
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.URL
import java.util.regex.Pattern
import javax.imageio.ImageIO

/**
 * @author: Sorcerer
 * @date: 2/3/2019
 * @description:
 */
class JikeVideoDownloader(
        private val tempDir: File,
        video: Video,
        id: String,
        type: PostType) {

    data class ParserVideo(
            val videoFile: File,
            val thumbFile: File,
            val height: Int,
            val width: Int,
            val duration: Int
    )

    init {
        tempDir.mkdir()
    }

    private val mediaMeta = JikeClient.instance.getMediaMeta(id, type)
    private val mediaUrl = mediaMeta.url!!
    private val thumbnailUrl = video.thumbnailUrl!!
    private val mediaId = extractMediaId(mediaUrl) ?: throw Exception("cannot extract media id")

    private val duration = (video.duration ?: 0) / 1000

    private val mediaDir = File(tempDir, mediaId).also { it.mkdir() }
    private val tsFile = File(mediaDir, "$mediaId.ts")
    private val mp4File = File(mediaDir, "$mediaId.mp4")
    private val thumbFile = File(mediaDir, "thumb")

    @Throws(Exception::class)
    fun download(): ParserVideo {
        if (!mediaUrl.endsWith(".m3u8")) {
            throw UnsupportedOperationException(Dialogues.UNSUPPORTED_VIDEO_TYPE())
        }

        val videoFile = if (mp4File.exists()) mp4File else downloadVideo()
        val thumbFile = if (thumbFile.exists()) thumbFile else downloadThumb(thumbnailUrl, thumbFile)

        if (videoFile.length() > 50 * 1024 * 1024) {
            throw Exception(Dialogues.ERROR_VIDEO_TOO_LARGE())
        }

        val image = ImageIO.read(thumbFile.inputStream())
        val height = image.height
        val width = image.width

        return ParserVideo(
                videoFile = videoFile, thumbFile = thumbFile,
                height = height, width = width,
                duration = duration
        )
    }

    @Throws(Exception::class)
    private fun downloadVideo(): File {
        URL(mediaUrl).openStream().use { inputStream ->
            val playlist: Playlist = PlaylistParser(inputStream, Format.EXT_M3U, Encoding.UTF_8, ParsingMode.LENIENT)
                    .parse()

            if (playlist.mediaPlaylist.tracks.size > 500) {
                throw Exception(Dialogues.ERROR_VIDEO_TOO_LARGE())
            }

            val list = playlist.mediaPlaylist.tracks.map {
                val target = File(tempDir, it.uri)
                if (!target.exists()) FileUtils.copyURLToFile(URL("https://media-qncdn.ruguoapp.com/${it.uri}"), target)
                return@map target
            }

            combineTs(list, tsFile)

            if (tsFile.length() > 50 * 1024 * 1024) {
                throw Exception(Dialogues.ERROR_VIDEO_TOO_LARGE())
            }

            convertTsToMp4(tsFile, mp4File)

            return mp4File
        }
    }

    companion object {
        private fun downloadThumb(thumbnailUrl: String, target: File): File {
            FileUtils.copyURLToFile(URL(thumbnailUrl), target)
            return target
        }

        private fun combineTs(tsList: List<File>, target: File) {
            FileOutputStream(target, true).use { fs ->
                fs.channel.use { resultFileChannel ->
                    tsList.forEach {
                        val tfs = FileInputStream(it)
                        val blk = tfs.channel
                        resultFileChannel.transferFrom(blk, resultFileChannel.size(), blk.size())
                        tfs.close()
                        blk.close()
                    }
                }
            }
        }

        private val ffmpeg = FFmpeg()
        private val ffprobe = FFprobe()

        private fun convertTsToMp4(source: File, target: File) {

            val builder = FFmpegBuilder()
                    .setInput(source.path)
                    .overrideOutputFiles(false)
                    .addOutput(target.path)
                    .setFormat("mp4")
                    .done()

            val executor = FFmpegExecutor(ffmpeg, ffprobe)
            executor.createJob(builder).run()
        }

        private val mediaIdPattern = Pattern.compile("https?://media-qncdn\\.ruguoapp\\.com/([a-z0-9\\-]+)\\.m3u8")

        private fun extractMediaId(url: String): String? {
            val matcher = mediaIdPattern.matcher(url)

            return if (matcher.find()) {
                matcher.group(1)
            } else null
        }
    }


}