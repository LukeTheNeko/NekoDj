import { Command } from "#base";
import { createQueueMetada, icon, res, validateVoiceState } from "#functions";
import { settings } from "#settings";
import { brBuilder, createEmbed, limitText } from "@magicyan/discord";
import { multimenu } from "@magicyan/discord-ui";
import { QueryType, SearchQueryType, useMainPlayer } from "discord-player";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

const disallowedQueryTypes = ["AUTO", "YOUTUBE", "YOUTUBE_PLAYLIST", "FACEBOOK", "VIMEO", "ARBITRARY", "REVERBNATION", "YOUTUBE_SEARCH", "YOUTUBE_VIDEO", "FILE", "AUTO_SEARCH"];

const engineChoices = Object.entries(QueryType)
    .filter(([value]) => !disallowedQueryTypes.includes(value))
    .map(([key, value]) => ({ name: key, value }));

new Command({
    name: "música",
    description: "🎵 Comando de música",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "tocar",
            description: "Tocar uma música",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "busca",
                    description: "Nome da música ou url",
                    type: ApplicationCommandOptionType.String,
                    required
                },
                {
                    name: "engine",
                    description: "Engine de busca",
                    type: ApplicationCommandOptionType.String,
                    choices: engineChoices
                }
            ]
        },
        {
            name: "pausar",
            description: "Pausa a música atual",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "retomar",
            description: "Retoma a música atual",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "parar",
            description: "Para a música atual",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "pular",
            description: "Pular músicas da fila",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "quantidade",
                    description: "Quantide de músicas para pular",
                    type: ApplicationCommandOptionType.Integer,
                    minValue: 1,
                }
            ]
        },
        {
            name: "pesquisar",
            description: "Pesquisar uma música",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "engine",
                    description: "Engine de busca",
                    type: ApplicationCommandOptionType.String,
                    choices: engineChoices,
                    required: true
                },
                {
                    name: "busca",
                    description: "Nome da música ou url",
                    type: ApplicationCommandOptionType.String,
                    required, autocomplete: true,
                }
            ]
        },
        {
            name: "fila",
            description: "Exibe a fila atual",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "embaralhar",
            description: "Embaralha a ordem das músicas na fila",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "selecionar",
            description: "Pular para uma música específica na fila",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "música",
                    description: "Selecione a música",
                    type: ApplicationCommandOptionType.String,
                    required, autocomplete: true,
                }
            ]
        }
    ],
    async autocomplete(interaction) {
        const { options, guild } = interaction;

        const player = useMainPlayer();
        const queue = player.queues.cache.get(guild.id);

        switch (options.getSubcommand(true)) {
            case "pesquisar": {
                const searchEngine = options.getString("engine", true);
                const focused = options.getFocused();

                try {
                    const results = await player.search(focused, {
                        searchEngine: searchEngine as SearchQueryType
                    });
                    if (!results.hasTracks()) return;

                    interaction.respond(results.tracks.map(track => ({
                        name: limitText(`${track.duration} - ${track.title}`, 100),
                        value: track.url
                    })).slice(0, 25));
                } catch (_) { }
                return;
            }
            case "selecionar": {
                if (!queue || queue.size < 1) return;

                const choices = queue.tracks.map((track, index) => ({
                    name: limitText(`${index}) ${track.title}`, 100),
                    value: track.id
                }));
                interaction.respond(choices.slice(0, 25));
                return;
            }
        }
    },
    async run(interaction) {
        const { options, member, guild, channel, client, user } = interaction;

        if (!user) {
            console.log("Usuário inválido.");
            return;
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            interaction.reply(res.danger(`${icon("warn3")} Você precisa estar em um canal de voz para usar este comando!`));
            return;
        }
        if (!channel) {
            interaction.reply(res.danger(`${icon("warn3")} Não possível utilizar este comando neste canal de texto!`));
            return;
        }

        const metadata = createQueueMetada({ channel, client, guild, voiceChannel });

        const player = useMainPlayer();
        const queue = player.queues.cache.get(guild.id);

        await interaction.deferReply({ ephemeral });

        if (!validateVoiceState(interaction)) return;

        switch (options.getSubcommand(true)) {
            case "tocar": {
                const query = options.getString("busca", true);
                const searchEngine = options.getString("engine") ?? QueryType.SPOTIFY_SEARCH;

                try {
                    const { track, searchResult, queue } = await player.play(voiceChannel as never, query, {
                        searchEngine: searchEngine as SearchQueryType,
                        nodeOptions: { metadata },
                        requestedBy: user.id,
                    });
                    
                    const display: string[] = [];

                    if (searchResult.playlist) {
                        const { tracks, title, url } = searchResult.playlist;
                        display.push(
                            `${icon("check")} Adicionadas ${tracks.length} da playlist [${title}](${url})`,
                            ...tracks.map(track => `${track.title}`).slice(0, 8),
                            "..."
                        );
                    } else {
                        display.push(`${icon("check")} ${queue?.size ? "Adicionado à fila" : "Tocando agora"} ${track.title}`);
                    }
                    interaction.editReply(res.success(brBuilder(display)));
                } catch (_) {
                    interaction.editReply(res.danger(`${icon("warn3")} Não foi possível tocar a música`));
                }
                return;
            }
            case "pesquisar": {
                const trackUrl = options.getString("busca", true);
                const searchEngine = options.getString("engine", true) as SearchQueryType;

                try {
                    const { track } = await player.play(voiceChannel as never, trackUrl, {
                        searchEngine, nodeOptions: { metadata },
                        requestedBy: user.id,
                    });

                    const text = queue?.size ? "Adicionado à fila" : "Tocando agora";
                    interaction.editReply(res.success(`${icon("check")} ${text} ${track.title}`));
                } catch (_) {
                    interaction.editReply(res.danger(`${icon("warn3")} Não foi possível tocar a música`));
                }
                return;
            }
        }

        if (!queue) {
            interaction.editReply(res.danger(`${icon("warn3")} Não há uma fila de reprodução ativa!`));
            return;
        }

        switch (options.getSubcommand(true)) {
            case "pausar": {
                if (queue.node.isPaused()) {
                    interaction.editReply(res.danger(`${icon("warn3")} A música atual já está pausada!`));
                    return;
                }
                queue.node.pause();
                interaction.editReply(res.success(`${icon("warn3")} A música atual foi pausada!`));
                return;
            }
            case "retomar": {
                if (!queue.node.isPaused()) {
                    interaction.editReply(res.danger(`${icon("warn3")} A música atual não está pausada!`));
                    return;
                }
                queue.node.resume();
                interaction.editReply(res.success(`${icon("check")} A música atual foi retomada!`));
                return;
            }
            case "parar": {
                queue.node.stop();
                interaction.editReply(res.success(`${icon("check")} A música atual foi parada!`));
                return;
            }
            case "pular": {
                const amount = options.getInteger("quantidade") ?? 1;
                const skipAmount = Math.min(queue.size, amount);
                for (let i = 0; i < skipAmount; i++) {
                    queue.node.skip();
                }
                interaction.editReply(res.success(`${icon("check")} Músicas puladas com sucesso!`));
                return;
            }
            case "fila": {
                multimenu({
                    embed: createEmbed({
                        color: settings.color.theme.magic,
                        description: brBuilder(
                            `# ${icon("gear")} Fila atual`,
                            `${icon("warn2")} Músicas: ${queue.tracks.size}`,
                            "",
                            `**${icon("music")} Música Atual**:: ${queue.currentTrack?.title ?? "Nenhuma"}`,
                        )
                    }),
                    items: queue.tracks.map(track => ({
                        color: settings.color.theme.magic,
                        description: brBuilder(
                            `**${icon("music")} Música**: [${track.title}](${track.url})`,
                            `**${icon("user")} Autor**: ${track.author}`,
                            `**${icon("clock")} Duração**: ${track.duration}`,
                            `**${icon("upload")} Soliciado Por**: ${track.requestedBy?.username}`,
                        ),
                        thumbnail: track.thumbnail
                    })),
                    render: (embeds, components) => interaction.editReply({ embeds, components })
                });
                return;
            }
            case "embaralhar": {
                queue.tracks.shuffle();
                interaction.editReply(res.success(`${icon("check")} A fila foi embaralhada!`));
                return;
            }
            case "selecionar": {
                const trackId = options.getString("música", true);

                try {
                    const skipped = queue.node.skipTo(trackId);
                    interaction.editReply(skipped
                        ? res.success(`${icon("check")} Músicas puladas com sucesso!`)
                        : res.danger(`${icon("warn3")} Nenhum música foi pulada!`)
                    );
                } catch (_) {
                    interaction.editReply(res.danger(`${icon("warn3")} Não foi possível pular para a música selecionada`));
                }
                return;
            }
        }
    }
});