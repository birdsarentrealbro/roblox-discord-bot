# Discord ↔ Roblox Chat Bridge (Render-Ready)

## 🌐 Hosting on Render

1. Create a free account at https://render.com
2. Create a **new Web Service** and connect your GitHub repo
3. Use these **Environment Variables** in the Render dashboard:

```
DISCORD_TOKEN=your_bot_token_here
CHANNEL_ID=your_channel_id_here
```

4. Set the **Start Command** to:
```
node bot.js
```

5. Done! Render will give you a public URL like `https://your-app-name.onrender.com`

---

## API Endpoints

- `POST /roblox-to-discord` → From Roblox to Discord
- `GET /discord-to-roblox` → From Discord to Roblox

Roblox can use `HttpService` to call these URLs.
