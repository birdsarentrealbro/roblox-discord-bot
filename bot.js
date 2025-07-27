const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!DISCORD_WEBHOOK_URL) {
  console.error('❌ DISCORD_WEBHOOK_URL environment variable not set!');
  process.exit(1);
}

// Store latest Discord message for Roblox to fetch
let latestMessage = null;

// Receive Roblox messages and send via webhook
app.post('/roblox-to-discord', async (req, res) => {
  const { username, message } = req.body;
  console.log('[POST /roblox-to-discord] Received:', username, message);

  if (!username || !message) {
    return res.status(400).send('Invalid data');
  }

  try {
    // Generate Roblox avatar headshot URL
    // Roblox headshot URL format:
    // https://www.roblox.com/headshot-thumbnail/image?userId=USERID&width=48&height=48&format=png

    // We need userId, so ideally Roblox sends it or you fetch it via API
    // For simplicity, let's assume username == Roblox username
    // We'll fetch userId from Roblox API:

    const userId = await getRobloxUserId(username);
    const avatarUrl = userId
      ? `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=48&height=48&format=png`
      : null;

    const payload = {
      username: username,
      content: message,
      avatar_url: avatarUrl,
    };

    await axios.post(DISCORD_WEBHOOK_URL, payload);
    console.log('✅ Sent message via webhook:', payload);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error sending webhook message:', err);
    res.status(500).send('Failed to send message');
  }
});

// Helper: fetch Roblox userId by username (simple GET to Roblox API)
async function getRobloxUserId(username) {
  try {
    const resp = await axios.get(
      `https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(username)}`
    );
    if (resp.data && resp.data.Id) {
      return resp.data.Id;
    } else {
      console.warn(`⚠️ Roblox user not found: ${username}`);
      return null;
    }
  } catch (e) {
    console.warn(`⚠️ Failed to get Roblox userId for ${username}:`, e.message);
    return null;
  }
}

// Receive Discord messages normally (no changes here)
app.post('/discord-to-roblox', (req, res) => {
  // your existing code for this route or remove if not needed
  res.sendStatus(200);
});

// Just a dummy GET to keep code consistent
app.get('/discord-to-roblox', (req, res) => {
  res.json({ message: null });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
