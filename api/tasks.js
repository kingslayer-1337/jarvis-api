export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.query.token || (req.body && req.body.token) || '';
  if (token !== process.env.JARVIS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN;
  if (!APPS_SCRIPT_URL) return res.status(500).json({ error: 'APPS_SCRIPT_URL not configured' });

  const action = req.query.action || (req.body && req.body.action) || 'list';
  const q = req.query;

  try {
    if (action === 'list') {
      const url = `${APPS_SCRIPT_URL}?action=list&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}`;
      const r = await fetch(url, { redirect: 'follow' });
      return res.status(200).json(await r.json());
    }

    // ADD — flat params: title, status, priority, category, notes, tags, due
    if (action === 'add') {
      const task = {
        id: q.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`,
        title: q.title || (req.body && req.body.title) || '',
        status: q.status || (req.body && req.body.status) || 'not-started',
        priority: q.priority || (req.body && req.body.priority) || 'medium',
        category: q.category || (req.body && req.body.category) || 'work',
        notes: q.notes || (req.body && req.body.notes) || '',
        tags: q.tags || (req.body && req.body.tags) || '',
        due: q.due || (req.body && req.body.due) || '',
        created: new Date().toISOString(),
      };
      if (!task.title) return res.status(400).json({ error: 'Missing title' });
      const url = `${APPS_SCRIPT_URL}?action=add&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}&task=${encodeURIComponent(JSON.stringify(task))}`;
      const r = await fetch(url, { redirect: 'follow' });
      return res.status(200).json(await r.json());
    }

    // UPDATE — flat params: id, plus any fields to change (status, priority, title, notes, due, tags)
    if (action === 'update') {
      const id = q.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const fields = {};
      ['status','priority','title','notes','due','tags','category'].forEach(function(k) {
        if (q[k] !== undefined) fields[k] = q[k];
        else if (req.body && req.body[k] !== undefined) fields[k] = req.body[k];
      });
      if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'No fields to update' });
      const url = `${APPS_SCRIPT_URL}?action=update&token=${encodeURIComponent(APPS_SCRIPT_TOKEN)}&id=${encodeURIComponent(id)}&fields=${encodeURIComponent(JSON.stringify(fields))}`;
      const r = await fetch(url, { redirect: 'follow' });
      return res.status(200).json(await r.json());
    }

    return res.status(400).json({ error: 'Unknown action. Use: list, add, update' });

  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
