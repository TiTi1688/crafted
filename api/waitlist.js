export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, service, contact, lang } = req.body;
  if (!name || !email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_ID },
        properties: {
          '名称': {
            title: [{ text: { content: name } }]
          },
          '电子邮件': {
            rich_text: [{ text: { content: email } }]
          },
          'Service': {
            rich_text: [{ text: { content: service } }]
          },
          'Contact': {
            rich_text: [{ text: { content: contact || '' } }]
          },
          'Language': {
            rich_text: [{ text: { content: lang || 'zh' } }]
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Notion API error', detail: err });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
