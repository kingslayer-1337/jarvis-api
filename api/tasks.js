export default async function handler(req, res) {
  // CORS — allow Claude and your task app to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth — check bearer token or query param
  const token =
    (req.headers.authorization || '').replace('Bearer ', '') ||
    req.query.token ||
    (req.body && req.body.token) ||
    '';

  if (token !== process.env.JARVIS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL not configured' });
  }

  const action = req.query.action || (req.body && req.body.action);

  try {
    if (req.method === 'GET' || action === 'list') {
      // Forward list request to Apps Script
      const scriptToken = process.env.APPS_SCRIPT_TOKEN;
      const url = `${APPS_SCRIPT_URL}?action=list&token=${encodeURIComponent(scriptToken)}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'add') {
      const task = req.body?.task || (req.query.task ? JSON.parse(req.query.task) : null);
      if (!task) return res.status(400).json({ error: 'Missing task' });
      const scriptToken = process.env.APPS_SCRIPT_TOKEN;
      const url = `${APPS_SCRIPT_URL}?action=add&token=${encodeURIComponent(scriptToken)}&task=${encodeURIComponent(JSON.stringify(task))}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'update') {
      const id = req.body?.id || req.query.id;
      const fields = req.body?.fields || (req.query.fields ? JSON.parse(req.query.fields) : null);
      if (!id || !fields) return res.status(400).json({ error: 'Missing id or fields' });
      const scriptToken = process.env.APPS_SCRIPT_TOKEN;
      const url = `${APPS_SCRIPT_URL}?action=update&token=${encodeURIComponent(scriptToken)}&id=${encodeURIComponent(id)}&fields=${encodeURIComponent(JSON.stringify(fields))}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
