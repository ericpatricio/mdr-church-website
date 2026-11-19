import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {languages} from '../content/site.mjs';

const root = process.cwd();
const prefix = '/mdr-church-website/';
const cmsPreview = process.argv.includes('--cms-poc');
const port = Number(process.env.MDR_PREVIEW_PORT || 4173);
const types = {
  html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript',
  mjs: 'text/javascript', svg: 'image/svg+xml', jpg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp',
};

const server = http.createServer((req, res) => {
  try {
    const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (url === '/') {
      res.writeHead(302, {Location: prefix});
      res.end();
      return;
    }
    if (!url.startsWith(prefix)) { res.writeHead(404); res.end(); return; }
    const relative = url.slice(prefix.length) || 'index.html';
    if (relative.split('/').some(segment => segment.startsWith('.')) || relative.startsWith('studio/')) {
      res.writeHead(403); res.end(); return;
    }
    let target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', types[target.split('.').pop().toLowerCase()] || 'application/octet-stream');
    const match = relative.match(/^(es|en)\/(index|eventos)\.html$/);
    if (cmsPreview && match) {
      const language = match[1];
      const translations = languages[language];
      const config = JSON.stringify({language, translations: {
        eventDetails: translations.eventDetails,
        eventCancelled: translations.eventCancelled,
        eventRegister: translations.eventRegister,
      }}).replaceAll('<', '\\u003c');
      const injection = `<script type="application/json" data-cms-poc-config>${config}</script><script type="module" src="../assets/cms-poc-ui.mjs"></script>`;
      res.setHeader('Cache-Control', 'no-store');
      res.end(fs.readFileSync(target, 'utf8').replace('</body>', injection + '</body>'));
    } else {
      fs.createReadStream(target).pipe(res);
    }
  } catch {
    res.writeHead(400);
    res.end();
  }
});
server.listen(port, '127.0.0.1', () => {
  console.log(`Local: http://127.0.0.1:${server.address().port}${prefix}`);
  if (cmsPreview) console.log('Local CMS POC mode only; generated files remain file-based.');
});
