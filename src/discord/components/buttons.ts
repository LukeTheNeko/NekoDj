import { Component } from "#base";
import { icon, res, validateVoiceState } from "#functions";
import { useMainPlayer } from "discord-player";
import { ComponentType } from "discord.js";

const player = useMainPlayer();

player.events.on("playerStart", (queue) => {

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