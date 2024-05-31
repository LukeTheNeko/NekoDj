import { getQueueMetadata, icon } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { GuildQueueHistory, useMainPlayer } from "discord-player";
import { ButtonBuilder, ButtonStyle } from "discord.js";

const player = useMainPlayer();

player.events.on("playerStart", (queue, track) => {
    const { channel, voiceChannel } = getQueueMetadata(queue);

    const queueHistory = new GuildQueueHistory(queue);
    const nextTrack = queueHistory.nextTrack;

    const embed = createEmbed({
        color: settings.color.tailwind.violet[500],
        title: `Tocando agora 🎵`,
        thumbnail: track.thumbnail,
        url: track.url,
        description: brBuilder(
            `**${icon("music")} Música:** ${track.title}`,
            `**${icon("user")} Autor:** ${track.author}`,
            `**${icon("speaker")} Canal de Voz:** ${voiceChannel}`,
            `**${icon("clock")} Duração:** ${track.duration}`,
            `**${icon("next")} Próxima Música:** ${nextTrack ? nextTrack.title : "Nenhuma"}`,
            `**${icon("trend")} Músicas na fila:** ${queue.tracks.size}`,
        ),
        footer: { 
            text: `Solicitado Por: ${track.requestedBy ? track.requestedBy.displayName : 'Unknown User'}`, 
            iconURL: track.requestedBy ? track.requestedBy.displayAvatarURL() : undefined 
        }
    });

    const row = createRow(
        new ButtonBuilder({
            customId: "shuffle-button",
            style: ButtonStyle.Secondary,
            emoji: icon("shuffle"),
        }),
        new ButtonBuilder({
            customId: "skipback-button",
            style: ButtonStyle.Primary,
            emoji: icon("skipback"),
        }),
        new ButtonBuilder({
            customId: "pause-button",
            style: ButtonStyle.Danger,
            emoji: icon("pause"),
        }),
        new ButtonBuilder({
            customId: "skip-button",
            style: ButtonStyle.Primary,
            emoji: icon("skip"),
        }),
        new ButtonBuilder({
            customId: "replay-button",
            style: ButtonStyle.Secondary,
            emoji: icon("replay"),
        })
    );

    channel.send({ embeds: [embed], components: [row] });

});