export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token =
    req.query.token ||
    (req.body && req.body.token) ||
    (req.headers.authorization || '').replace('Bearer ', '') ||
    '';

  if (token !== process.env.JARVIS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN;

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL not configured' });
  }

  const action = req.query.action || (req.body && req.body.action) || 'list';

  try {
    if (action === 'list') {
      const url = `${APPS_SCRIPT_URL}?action=list&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'add') {
      let task = (req.body && req.body.task) || null;
      if (!task && req.query.task) task = JSON.parse(decodeURIComponent(req.query.task));
      if (!task) return res.status(400).json({ error: 'Missing task' });
      const url = `${APPS_SCRIPT_URL}?action=add&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}&task=${encodeURIComponent(JSON.stringify(task))}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'update') {
      const id = (req.body && req.body.id) || req.query.id;
      let fields = (req.body && req.body.fields) || null;
      if (!fields && req.query.fields) fields = JSON.parse(decodeURIComponent(req.query.fields));
      if (!id || !fields) return res.status(400).json({ error: 'Missing id or fields' });
      const url = `${APPS_SCRIPT_URL}?action=update&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}&id=${encodeURIComponent(id)}&fields=${encodeURIComponent(JSON.stringify(fields))}`;
      const response = await fetch(url, { redirect: 'follow' });
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Unknown action. Use: list, add, update' });

  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
