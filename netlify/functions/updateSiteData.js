const { Buffer } = require('buffer');

exports.handler = async function(event, context) {
  const REPO = process.env.REPO; // owner/repo
  const TOKEN = process.env.GITHUB_TOKEN;
  if (!REPO || !TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured. Set REPO and GITHUB_TOKEN.' }) };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const apiBase = `https://api.github.com/repos/${REPO}/contents/data/site-data.json`;
  const headers = { Authorization: `token ${TOKEN}`, 'User-Agent': 'siri-admin', 'Content-Type': 'application/json' };

  try {
    // Check if file exists to obtain sha
    const getRes = await fetch(apiBase + '?ref=main', { headers });
    let sha = null;
    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
    const body = {
      message: 'Update site data from admin',
      content,
      branch: 'main'
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });
    const putJson = await putRes.json();
    if (!putRes.ok) {
      return { statusCode: putRes.status, body: JSON.stringify({ error: putJson }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true, result: putJson }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
