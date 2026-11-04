/**
 * Telegram Bot Example
 * Commands: /yt <query>, /sp <query>
 * Requires: grammy
 */
import { Bot, type Context } from "grammy";
import { SociolodClient } from "sociolod";

const sociolod = new SociolodClient({ cache: { enabled: true } });

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("yt", async (ctx: Context) => {
    const query = ctx.message?.text?.replace("/yt", "").trim();
    if (!query) {
      await ctx.reply("Usage: /yt <search query>");
      return;
    }

    await ctx.reply("🔍 Searching YouTube...");
    const video = await sociolod.youtube.search.video(query);
    const { url: dlUrl } = await sociolod.youtube.download.url(video.url, { format: "mp3" });

    await ctx.reply(
      `🎵 *${video.title}*\n` +
        `📺 Channel: ${video.channel.title}\n` +
        `⏱ Duration: ${video.duration}\n` +
        `🔗 [YouTube](${video.url})\n` +
        `📥 [Download MP3](${dlUrl})`,
      { parse_mode: "Markdown" },
    );
  });

  bot.command("sp", async (ctx: Context) => {
    const query = ctx.message?.text?.replace("/sp", "").trim();
    if (!query) {
      await ctx.reply("Usage: /sp <search query>");
      return;
    }

    await ctx.reply("🎵 Searching Spotify...");
    const track = await sociolod.spotify.search.song(query);

    await ctx.reply(
      `🟢 *${track.name}*\n` +
        `👤 Artist: ${track.artists[0]?.name ?? "Unknown"}\n` +
        `💿 Album: ${track.album.name}\n` +
        `⏱ Duration: ${track.durationFormatted}\n` +
        `🔗 [Open in Spotify](${track.url})`,
      { parse_mode: "Markdown" },
    );
  });

  return bot;
}

// Start: const bot = createBot(process.env.TELEGRAM_TOKEN!); bot.start();
