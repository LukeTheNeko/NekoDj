import { Component } from "#base";
import { getQueueMetadata, icon, res, setSongStatus } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, createRow } from "@magicyan/discord";
import { useMainPlayer } from "discord-player";
import { ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const player = useMainPlayer();

player.events.on("playerStart", (queue, track) => {
    const { client, channel, voiceChannel } = getQueueMetadata(queue);

    setSongStatus(client, track);

    const embed = createEmbed({
        color: settings.color.tailwind.violet[900],
        title: `Tocando agora`,
        thumbnail: track.thumbnail,
        url: track.url,
        description: brBuilder(
            `**${icon("music")} Música**: ${track.title}`,
            `**${icon("user")} Autor**: ${track.author}`,
            `**${icon("speaker")} Canal**: ${voiceChannel}`,
            `**${icon("clock")} Duração**: ${track.duration}`
        )
    });

    /* const row = createRow(
        new ButtonBuilder({
            customId: `shuffle-button`,
            label: "Iniciar",
            style: ButtonStyle.Primary,
            emoji: icon("shuffle"),
        }),
        new ButtonBuilder({
            customId: `skipback-button`,
            label: "Voltar",
            style: ButtonStyle.Danger,
            emoji: icon("skipback"),
        }),
        new ButtonBuilder({
            customId: `pause-button`,
            label: "Parar",
            style: ButtonStyle.Danger,
            emoji: icon("pause"),
        }),
        new ButtonBuilder({
            customId: `skip-button`,
            label: "Avançar",
            style: ButtonStyle.Danger,
            emoji: icon("skip"),
        }),
        new ButtonBuilder({
            customId: `replay-button`,
            label: "Replay",
            style: ButtonStyle.Danger,
            emoji: icon("replay"),
        })
    );

    new Component({
        customId: "skip-button",
        type: ComponentType.Button, cache: "cached",
        async run(interaction) {
            queue.node.skip
            interaction.editReply(res.success(`${icon("check")} Músicas puladas com sucesso!`));
        },
    });

    channel.send({ embeds: [embed], components: [row] }); */
    channel.send({ embeds: [embed] }); 

});

