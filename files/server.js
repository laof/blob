import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 7777;
const distPath = path.join(__dirname, './dist');

// MIME 类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// 递归获取 dist 目录下的所有文件（返回相对路径）
function getAllFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // 处理根路径
  if (pathname === '/') {
    // 如果文件不存在，返回 dist 目录下所有文件列表
    try {
      const files = getAllFiles(distPath);
      const listItems = files
        .map((f) => `<li><a href="/${f}">${f}</a></li>`)
        .join('');

      const html = `<h1>dist 目录文件列表</h1><ul>${listItems}</ul>`;

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('读取 dist 目录失败');
    }
    return;
  }

  let filePath = path.join(distPath, pathname);

  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 如果文件不存在，返回 index.html（用于 SPA 路由）
      filePath = path.join(distPath, 'index.html');
    }

    // 读取并返回文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      // 设置正确的 Content-Type
      const ext = path.extname(filePath);
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`服务目录: ${distPath}`);

  // 根据操作系统自动打开浏览器
  // eslint-disable-next-line no-undef
  const command = process.platform === 'win32'
    ? `start ${serverUrl}`
    // eslint-disable-next-line no-undef
    : process.platform === 'darwin'
      ? `open ${serverUrl}`
      : `xdg-open ${serverUrl}`;

  console.log(`${serverUrl}`);

  exec(command, () => { });
});
