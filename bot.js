// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const DISCORD_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const CHANNEL_ID = 'YOUR_CHANNEL_ID'; // Get this from right-clicking a Discord channel

client.login(DISCORD_TOKEN);

app.use(bodyParser.json());

// 📤 Roblox → Discord
app.post('/roblox-to-discord', (req, res) => {
    const message = req.body.message;
    const username = req.body.username || 'Roblox';
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
        channel.send(`**${username}:** ${message}`);
    }
    res.sendStatus(200);
});

// 📥 Discord → Roblox (send messages to connected players later)
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
        latestMessage = null; // Clear it after sending once
    } else {
        res.json({ message: null });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
