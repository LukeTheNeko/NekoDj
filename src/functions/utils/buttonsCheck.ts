import { ButtonInteraction, CommandInteraction, GuildMember } from 'discord.js';
import { res } from "./embed.js";
import { icon } from "./emojis.js";

export function validateVoiceState(interaction: ButtonInteraction | CommandInteraction) {
    const voiceState = (interaction.member as GuildMember).voice;
    const botVoiceChannel = interaction.guild?.voiceStates.cache.get(interaction.client.user!.id)?.channel;

    if (!voiceState || !voiceState.channel) {
        interaction.editReply(res.danger(`${icon("warn3")} Você precisa estar em uma chamada de voz para usar este comando!`));
        return false;
    }

    if (!botVoiceChannel) {
        interaction.editReply(res.danger(`${icon("warn3")} O bot não está em uma chamada de voz!`));
        return false;
    }

    if (voiceState.channel.id !== botVoiceChannel.id) {
        interaction.editReply(res.danger(`${icon("warn3")} Você precisa estar na mesma chamada de voz que o bot para usar este comando!`));
        return false;
    }

    return true;
}