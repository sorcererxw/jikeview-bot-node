import Telegraf, {TelegrafOptions} from 'telegraf';
import JikeUrlParser, {JikeUrl} from './jike/JikeUrlParser'
import JikeApi from './jike/JikeApi'

// const Telegraf = require('telegraf/telegraf.js');

const SocksProxyAgent = require('socks-proxy-agent');

// SOCKS proxy to connect to
const proxy = process.env.socks_proxy || 'socks://127.0.0.1:1080';
console.log('using proxy server %j', proxy);
const options: TelegrafOptions = {
    telegram: {
        agent: new SocksProxyAgent(proxy)
    },
    username: 'jikeview_debug_bot',
};
// const bot = new Telegraf('763241017:AAFhHszySkYuw5KCB7SSU34kpXATk13WtUM', options);
const bot = new Telegraf('873110248:AAElie6zGMeXkWTy3IFASw1pzppJVfdkThI', options);

bot.start((ctx) => ctx.reply('welcome'));

bot.on('message', async ctx => {
    console.log(ctx.message);
    if (ctx.message.text === undefined) return;
    const urls: RegExpMatchArray | null = ctx.message.text.match(/\bhttps?:\/\/\S+/gi);
    if (urls == null || urls.length === 0) {
        await ctx.reply("not found url");
        return
    }
    const jikeUrls: JikeUrl[] = urls.map((it: string): JikeUrl | null => JikeUrlParser.parser(it))
        .filter((it: JikeUrl | null): boolean => it != null)
        .reduce((arr: JikeUrl[], v: JikeUrl): JikeUrl[] => arr.concat(v), []);
    if (jikeUrls.length === 0) {
        await ctx.reply("not found url");
        return
    }
    await ctx.reply("found follow urls" + jikeUrls.map(it => "\n" + JikeUrlParser.generateMessageUrl(it)).join(""));
    jikeUrls.forEach(async it => {
        const resultMessage = await ctx.reply("handle " + JikeUrlParser.generateMessageUrl(it));
        const post = await JikeApi.getPostByUrl(it);
        if (post === null) {
            await ctx.reply("fail");
            return
        }
        if (post.data.pictures !== undefined && post.data.pictures.length > 0) {
            await ctx.replyWithPhoto(post.data.pictures[0].picUrl, {caption: post.data.content})
        } else if (post.data.video !== undefined) {
            await ctx.replyWithVideo(post.data.pictures[0].picUrl, {caption: post.data.content})
        } else {
            await ctx.reply(post.data.content)
        }
    })
});

// noinspection JSIgnoredPromiseFromCall
bot.launch();
