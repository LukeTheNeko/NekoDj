import { Event } from "#base";
import { ActivityType } from "discord.js";

const activityMessages = [
    "Rap.",
    "Rock.",
    "Funk."
];

export default new Event({
    name: "ready",
    event: "ready",
    once: true,
    async run(client) {
        try {
            const updateActivity = () => {
                const randomMessage = activityMessages[Math.floor(Math.random() * activityMessages.length)];

                client.user.setPresence({
                    activities: [{ name: randomMessage, type: ActivityType.Listening }],
                    status: 'online',
                });
            };

            updateActivity();

            setInterval(updateActivity, 30 * 60 * 1000);

        } catch (error) {
            console.error("Ocorreu um erro:", error);
        }
    },
});