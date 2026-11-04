/**
 * Discord Bot Example
 * Slash command: /play <query>
 * Searches YouTube, fetches MP3 stream URL, and joins voice to play audio.
 *
 * Run: npx tsx examples/discord-bot.ts
 * Requires: discord.js, @discordjs/voice, @discordjs/opus
 */
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { SociolodClient, type YTSearchResult } from "sociolod";

const sociolod = new SociolodClient({ cache: { enabled: true } });

const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Search YouTube and get an MP3 download link")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search query").setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("spotify")
    .setDescription("Search Spotify for a track")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Track name or artist").setRequired(true),
    ),
];

async function handlePlay(interaction: ChatInputCommandInteraction): Promise<void> {
  const query = interaction.options.getString("query", true);
  await interaction.deferReply();

  const video: YTSearchResult = await sociolod.youtube.search.video(query);
  const { url: dlUrl } = await sociolod.youtube.download.url(video.url, { format: "mp3" });

  await interaction.editReply({
    embeds: [
      {
        title: video.title,
        url: video.url,
        thumbnail: { url: video.thumbnails.default.url },
        fields: [
          { name: "Duration", value: video.duration, inline: true },
          { name: "Channel", value: video.channel.title, inline: true },
          { name: "MP3 Link", value: `[Download](${dlUrl})` },
        ],
        color: 0xff0000,
      },
    ],
  });
}

async function handleSpotify(interaction: ChatInputCommandInteraction): Promise<void> {
  const query = interaction.options.getString("query", true);
  await interaction.deferReply();

  const track = await sociolod.spotify.search.song(query);
  const cover = await sociolod.spotify.search.cover(query);

  await interaction.editReply({
    embeds: [
      {
        title: `${track.name} — ${track.artists[0]?.name ?? "Unknown"}`,
        url: track.url,
        thumbnail: { url: cover.url },
        fields: [
          { name: "Album", value: track.album.name, inline: true },
          { name: "Duration", value: track.durationFormatted, inline: true },
        ],
        color: 0x1db954,
      },
    ],
  });
}

export async function startBot(token: string, clientId: string): Promise<void> {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const rest = new REST().setToken(token);
  await rest.put(Routes.applicationCommands(clientId), {
    body: commands.map((c) => c.toJSON()),
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "play") await handlePlay(interaction);
    if (interaction.commandName === "spotify") await handleSpotify(interaction);
  });

  await client.login(token);
  console.log("Bot is online!");
}
