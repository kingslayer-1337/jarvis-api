# Jarvis API

Lightweight proxy that sits between Claude and your Google Apps Script task backend.
Claude fetches this URL — Vercel fetches your Apps Script — Claude gets your tasks.

## Deploy to Vercel

1. Upload this folder to a GitHub repo (or use Vercel CLI)
2. Import the repo at vercel.com/new
3. Add these environment variables in Vercel's dashboard:

| Variable | Value |
|---|---|
| `JARVIS_TOKEN` | A new secret token you create (this is what you give Claude) |
| `APPS_SCRIPT_URL` | Your Google Apps Script web app URL |
| `APPS_SCRIPT_TOKEN` | Your Apps Script secret token |

4. Deploy — done.

## Usage

**List tasks:**
```
GET https://your-app.vercel.app/api/tasks?token=YOUR_JARVIS_TOKEN
```

**Add a task:**
```
POST https://your-app.vercel.app/api/tasks
{ "token": "YOUR_JARVIS_TOKEN", "action": "add", "task": { "title": "...", "status": "not-started", ... } }
```

**Update a task:**
```
POST https://your-app.vercel.app/api/tasks
{ "token": "YOUR_JARVIS_TOKEN", "action": "update", "id": "TASK_ID", "fields": { "status": "completed" } }
```

**Give Claude this at the start of each session:**
```
My task list: https://your-app.vercel.app/api/tasks?token=YOUR_JARVIS_TOKEN
Please fetch it and load my tasks.
```
