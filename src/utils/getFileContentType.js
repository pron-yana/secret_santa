export function getFileContentType(url) {
  if (url.endsWith('.css')) return 'text/css';
  if (url.endsWith('.js')) return 'application/javascript';
  if (url.endsWith('.png')) return 'image/png';
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  if (url.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}
