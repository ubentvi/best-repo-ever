const form = document.querySelector('#record-form');
const input = document.querySelector('#record-id');
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const list = document.querySelector('#document-list');
const count = document.querySelector('#count');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const recordId = input.value.trim();
  status.className = 'status';
  status.textContent = 'Searching Salesforce...';
  results.hidden = true;
  list.replaceChildren();

  try {
    const response = await fetch(`/api/documents?recordId=${encodeURIComponent(recordId)}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Unable to load documents.');
    body.documents.forEach((document) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `/api/download?versionId=${encodeURIComponent(document.versionId)}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = document.title;
      const extension = document.createElement('span');
      extension.className = 'extension';
      extension.textContent = document.fileExtension || 'file';
      link.append(extension);
      item.append(link);
      list.append(item);
    });
    count.textContent = `${body.documents.length} file${body.documents.length === 1 ? '' : 's'}`;
    results.hidden = false;
    status.textContent = body.documents.length ? '' : 'No documents are linked to this record.';
  } catch (error) {
    status.className = 'status error';
    status.textContent = error.message;
  }
});