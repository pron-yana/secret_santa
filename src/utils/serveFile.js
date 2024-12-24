import fs from 'fs/promises';

export async function serveFile(res, filePath, contentType) {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File Not Found');
    console.error(`Error reading file: ${filePath}`, err);
  }
}
