import fs from 'fs/promises';

export async function createDataFile(path) {
  try {
    return await fs.mkdir(path, { recursive: true });
  } catch (err) {
    console.error('Помилка створення папки:', err);
  }
}
