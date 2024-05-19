import { Component } from "#base";
import { getQueueMetadata, icon, res } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { GuildQueueHistory, useMainPlayer } from "discord-player";
import { ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const player = useMainPlayer();

player.events.on("playerStart", (queue, track) => {
    const { channel, voiceChannel, requestedBy } = getQueueMetadata(queue);

    const queueHistory = new GuildQueueHistory(queue);

    const nextTrack = queueHistory.nextTrack;

    const embed = createEmbed({
        color: settings.color.tailwind.violet[800],
        title: `Tocando agora 🎵`,
        thumbnail: track.thumbnail,
        url: track.url,
        description: brBuilder(
            `**${icon("music")} Música**: ${track.title}`,
            `**${icon("user")} Autor**: ${track.author}`,
            `**${icon("speaker")} Canal**: ${voiceChannel}`,
            `**${icon("clock")} Duração**: ${track.duration}`,
            `**${icon("upload")} Soliciado Por**: ${requestedBy}`,
            `**${icon("next")} Próxima Música**: ${nextTrack ? nextTrack.title : "Nenhuma"}`,
        ),
        footer: { text: `Músicas na fila: ${queue.tracks.size}`, iconURL: track.thumbnail }
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

    new Component({
        customId: "shuffle-button",
        type: ComponentType.Button, cache: "cached",
        async run(interaction) {
            queue.tracks.shuffle();
            interaction.reply(res.success(`${icon("check")} A fila foi embaralhada!`));
            return;
        },
    });

    new Component({
        customId: "skipback-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

            const amount = 1;
            const skipAmount = Math.min(queue.size, amount);
            for (let i = 0; i < skipAmount; i++) {
                queue.history.previous();
            }

            interaction.reply(res.success(`${icon("check")} Música pulada com sucesso!`));

        },
    });

    new Component({
        customId: "pause-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

            if (queue.node.isPaused()) {
                queue.node.resume();
                interaction.reply(res.success(`${icon("check")} A música atual foi retomada!`));
                return;
            }
            
            queue.node.pause(); 

            interaction.reply(res.success(`${icon("check")} A música atual foi pausada!`));
        }
    });

    new Component({
        customId: "skip-button",
        type: ComponentType.Button, cache: "cached",
        async run(interaction) {

            const amount = 1;
            const skipAmount = Math.min(queue.size, amount);
            for (let i = 0; i < skipAmount; i++) {
                queue.node.skip();
            }

            interaction.reply(res.success(`${icon("check")} Música pulada com sucesso!`));
        },
    });

    new Component({
        customId: "replay-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

            const newRepeatMode = queue.repeatMode === 1 ? 0 : 1;
            queue.setRepeatMode(newRepeatMode);
            const message = newRepeatMode === 1 ? "ativado" : "desativado";

            interaction.reply(res.success(`${icon("check")} Modo de repetição ${message}`));
        },
    });
});