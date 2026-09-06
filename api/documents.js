const { request } = require('./salesforce');

function validRecordId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(value);
}

module.exports = async function handler(req, res) {
  const recordId = req.query?.recordId;
  if (!validRecordId(recordId)) return res.status(400).json({ error: 'Enter a valid 15- or 18-character Salesforce record ID.' });

  const soql = `SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.LatestPublishedVersionId, ContentDocument.FileExtension FROM ContentDocumentLink WHERE LinkedEntityId = '${recordId}'`;
  try {
    const response = await request(`/query?q=${encodeURIComponent(soql)}`);
    const body = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: body[0]?.message || 'Salesforce query failed.' });
    const documents = (body.records || []).map((record) => ({
      id: record.ContentDocumentId,
      title: record.ContentDocument?.Title,
      versionId: record.ContentDocument?.LatestPublishedVersionId,
      fileExtension: record.ContentDocument?.FileExtension
    })).filter((document) => document.title && document.versionId);
    return res.status(200).json({ documents });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.validRecordId = validRecordId;