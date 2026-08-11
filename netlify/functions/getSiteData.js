const { Buffer } = require('buffer');

exports.handler = async function(event, context) {
  const REPO = process.env.REPO; // owner/repo
  const TOKEN = process.env.GITHUB_TOKEN;
  if (!REPO || !TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured. Set REPO and GITHUB_TOKEN.' }) };
  }

  const url = `https://api.github.com/repos/${REPO}/contents/data/site-data.json?ref=main`;
  try {
    const res = await fetch(url, { headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'siri-admin' } });
    if (res.status === 404) {
      return { statusCode: 204, body: JSON.stringify({}) };
    }
    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: txt }) };
    }
    const json = await res.json();
    const content = json.content || '';
    const decoded = Buffer.from(content, 'base64').toString('utf8');
    const data = JSON.parse(decoded || '{}');
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
