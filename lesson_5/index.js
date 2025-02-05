"use strict";

/**
* Используя наработки практического задания прошлого урока, создайте веб-версию приложения.
* Сделайте так, чтобы при запуске она:
* 1. показывала содержимое текущей директории;
* 2. давала возможность навигации по каталогам из исходной папки;
* 3. при выборе файла показывала его содержимое.
*/

import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { parse } from 'querystring';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    const indexPath = path.join(__dirname, 'index.html');
    const indexContent = await fs.readFile(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexContent);
    return;
  }

  const urlPath = decodeURIComponent(req.url).replace(/^\/api\//, '');
  // Путь может выходить за пределы базовой директории (в целях учебного примера оставил намеренно).
  const currentPath = path.resolve('/', urlPath); 

  // Определяем метод запроса
  if (req.method === 'GET') {
    await handleGetRequest(res, currentPath);
  } else if (req.method === 'POST') {
    await handlePostRequest(req, res, currentPath);
  } else if (req.method === 'DELETE') {
    await handleDeleteRequest(res, currentPath);
  } else {
    // Если метод запроса не поддерживается
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

/**
 * Обрабатываем GET-запросы.
 * Если текущий путь — директория, возвращает список содержимого.
 * Если путь — файл, возвращает его содержимое.
 */

async function handleGetRequest(res, currentPath) {
  try {
    const stats = await fs.lstat(currentPath);
    if (stats.isDirectory()) {
      const items = await fs.readdir(currentPath);
      const itemList = await Promise.all(items.map(async item => {
        const itemPath = path.join(currentPath, item);
        const itemStats = await fs.lstat(itemPath);
        return {
          name: item,
          path: itemPath,
          isDirectory: itemStats.isDirectory()
        };
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'directory', path: currentPath, items: itemList }));
    } else if (stats.isFile()) {
      const fileContent = await fs.readFile(currentPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ type: 'file', path: currentPath, content: fileContent }));
    }
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}

/**
 * Обрабатываем POST-запросы.
 * Создаёт новый файл или директорию в указанном пути.
 * Данные о новом файле или директории передаются в теле запроса.
 */

async function handlePostRequest(req, res, currentPath) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { name, type } = parse(body);
    const newPath = path.join(currentPath, name);
    try {
      if (type === 'file') {
        await fs.writeFile(newPath, '');
      } else {
        await fs.mkdir(newPath);
      }
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error creating file or directory' }));
    }
  });
}

/**
 * Обрабатываем DELETE-запросы.
 * Удаляет указанный файл или директорию.
 */

async function handleDeleteRequest(res, currentPath) {
  try {
    const stats = await fs.lstat(currentPath);
    if (stats.isDirectory()) {
      await fs.rmdir(currentPath);
    } else {
      await fs.unlink(currentPath);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error deleting file or directory' }));
  }
}

server.listen(5555, () => {
  console.log('Сервер запущен на порту 5555');
});
