import { Component } from "#base";
import { getQueueMetadata, icon, res, validateVoiceState } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { GuildQueueHistory, useMainPlayer } from "discord-player";
import { ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

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

    new Component({
        customId: "shuffle-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

             await interaction.deferReply({ ephemeral });
            if (!validateVoiceState(interaction)) return;
    
            queue.tracks.shuffle();
            interaction.editReply(res.success(`${icon("check")} A fila foi embaralhada!`));
        },
    });
    
    new Component({
        customId: "skipback-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

            await interaction.deferReply({ ephemeral });
            if (!validateVoiceState(interaction)) return;

            const amount = 1;
            const skipAmount = Math.min(queue.size, amount);
            for (let i = 0; i < skipAmount; i++) {
                queue.history.previous();
            }

            interaction.editReply(res.success(`${icon("check")} Música pulada com sucesso!`));

        },
    });

    new Component({
        customId: "pause-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {
            await interaction.deferReply({ ephemeral });
            if (!validateVoiceState(interaction)) return;
    
            if (queue.node.isPaused()) {
                queue.node.resume();
                interaction.editReply(res.success(`${icon("check")} A música atual foi retomada!`));
                return;
            }
            
            queue.node.pause();
            interaction.editReply(res.success(`${icon("warn3")} A música atual foi pausada!`));
        }
    });

    new Component({
        customId: "skip-button",
        type: ComponentType.Button, cache: "cached",
        async run(interaction) {

            await interaction.deferReply({ ephemeral });
            if (!validateVoiceState(interaction)) return;

            const amount = 1;
            const skipAmount = Math.min(queue.size, amount);
            for (let i = 0; i < skipAmount; i++) {
                queue.node.skip();
            }

            interaction.editReply(res.success(`${icon("check")} Música pulada com sucesso!`));
        },
    });

    new Component({
        customId: "replay-button",
        type: ComponentType.Button,
        cache: "cached",
        async run(interaction) {

            await interaction.deferReply({ ephemeral });
            if (!validateVoiceState(interaction)) return;

            const newRepeatMode = queue.repeatMode === 1 ? 0 : 1;
            queue.setRepeatMode(newRepeatMode);
            const message = newRepeatMode === 1 ? "ativado" : "desativado";

            interaction.editReply(res.success(`${icon("check")} Modo de repetição ${message}`));
        },
    });
});