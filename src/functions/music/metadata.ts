import { GuildQueue } from "discord-player";
import { Client, Guild, GuildTextBasedChannel, User, VoiceBasedChannel } from "discord.js";

interface QueueMetadata {
    client: Client<true>;
    guild: Guild;
    voiceChannel: VoiceBasedChannel;
    channel: GuildTextBasedChannel;
    requestedBy: User;
}
export function createQueueMetada(metadata: QueueMetadata){
    return metadata;
}
export function getQueueMetadata(queue: GuildQueue): QueueMetadata {
    return queue.metadata as QueueMetadata;
}