const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const app = express();
app.use(express.json()); // Parse JSON bodies

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

let channel = null;

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  channel = client.channels.cache.get(CHANNEL_ID);

  if (channel) {
    console.log(`✅ Discord channel found: ${channel.name}`);
  } else {
    console.error(`❌ Could not find Discord channel with ID: ${CHANNEL_ID}`);
  }
});

client.login(DISCORD_TOKEN);

// Store latest Discord message for Roblox to fetch
let latestMessage = null;

// Roblox sends messages here (POST)
app.post('/roblox-to-discord', async (req, res) => {
  console.log('[POST /roblox-to-discord] Received data:', req.body);

  const { username, message } = req.body;

  if (!username || !message) {
    console.log('❌ Invalid data received');
    return res.status(400).send('Invalid data');
  }

  if (!channel) {
    console.log('❌ Discord channel not initialized yet');
    return res.status(500).send('Channel not ready');
  }

  try {
    await channel.send(`**${username}:** ${message}`);
    console.log('✅ Message sent to Discord:', message);
    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Failed to send message to Discord:', error);
    res.status(500).send('Failed to send message');
  }
});

// Discord to Roblox (GET)
client.on('messageCreate', (msg) => {
  if (msg.channel.id === CHANNEL_ID && !msg.author.bot) {
    latestMessage = {
      username: msg.author.username,
      message: msg.content,
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
