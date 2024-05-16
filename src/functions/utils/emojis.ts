import { settings } from "#settings";
import { formatEmoji } from "discord.js";

type EmojiList = typeof settings.emojis;
type EmojiKey = keyof EmojiList["icons"] | `:a:${keyof EmojiList["animated"]}` | `:s:${keyof EmojiList["discord"]}` | `:p:${keyof EmojiList["pose"]}`;

export function icon(name: EmojiKey){
    const animated = name.startsWith(":a:");
    const discordEmoji = name.startsWith(":s:");
    const pose = name.startsWith(":p:")
    let id: string = "";

    if (animated) {
        id = settings.emojis.animated[name.slice(3) as keyof EmojiList["animated"]];
    } 
    if (pose) {
        id = settings.emojis.pose[name.slice(3) as keyof EmojiList["pose"]];
    } 
    if (discordEmoji) {
        id = settings.emojis.discord[name.slice(3) as keyof EmojiList["discord"]];
    } 
    if (!animated && !discordEmoji && !pose) {
        id = settings.emojis.icons[name as keyof EmojiList["icons"]];
    }

    const toString = () => formatEmoji(id, animated);

    return { id, animated, toString };
}