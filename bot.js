const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.login(DISCORD_TOKEN);

app.use(bodyParser.json());

// Roblox to Discord
app.post('/roblox-to-discord', (req, res) => {
    const { username, message } = req.body;
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send(`**${username}:** ${message}`);
    }
    res.sendStatus(200);
});

// Discord to Roblox
let latestMessage = null;

client.on('messageCreate', (msg) => {
    if (msg.channel.id === CHANNEL_ID && !msg.author.bot) {
        latestMessage = {
            username: msg.author.username,
            message: msg.content
        };
    }
});

app.get('/discord-to-roblox', (req, res) => {
    if (latestMessage) {
        res.json(latestMessage);
        latestMessage = null;
    } else {
        res.json({ message: null });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
