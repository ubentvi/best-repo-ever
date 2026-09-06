const test = require('node:test');
const assert = require('node:assert/strict');
const { validRecordId } = require('../api/documents');
const documentsHandler = require('../api/documents');
const downloadHandler = require('../api/download');

function responseMock() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
    setHeader() {}
  };
}

test('accepts Salesforce 15- and 18-character IDs', () => {
  assert.equal(validRecordId('001000000000000'), true);
  assert.equal(validRecordId('001000000000000AAA'), true);
});

test('rejects malformed record IDs', () => {
  assert.equal(validRecordId(''), false);
  assert.equal(validRecordId('001'), false);
  assert.equal(validRecordId('001000000000000!!!!'), false);
});

test('documents endpoint rejects malformed record IDs before Salesforce access', async () => {
  const response = responseMock();
  await documentsHandler({ query: { recordId: 'not-an-id' } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /valid/);
});

test('download endpoint rejects malformed version IDs before Salesforce access', async () => {
  const response = responseMock();
  await downloadHandler({ query: { versionId: 'not-an-id' } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /ContentVersion/);
});