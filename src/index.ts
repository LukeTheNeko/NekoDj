import { createClient } from "#base"; 
import { Player } from "discord-player";
import "./tools/index.js";

const client = createClient();
client.start();

const player = new Player(client as never);
player.extractors.loadDefault();