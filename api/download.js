const { request } = require('./salesforce');

module.exports = async function handler(req, res) {
  const versionId = req.query?.versionId;
  if (typeof versionId !== 'string' || !/^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(versionId)) {
    return res.status(400).json({ error: 'A valid ContentVersion ID is required.' });
  }
  try {
    const response = await request(`/sobjects/ContentVersion/${versionId}/VersionData`);
    if (!response.ok) return res.status(response.status).send(await response.text());
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    if (response.headers.get('content-length')) res.setHeader('Content-Length', response.headers.get('content-length'));
    const data = Buffer.from(await response.arrayBuffer());
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};