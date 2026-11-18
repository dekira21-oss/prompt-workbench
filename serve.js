// 내 컴퓨터에서 미리 보기용 서버: node prompt-site/serve.js → http://localhost:5185
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname;
const T = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(root, path.normalize(p));
  if (!f.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "Content-Type": T[path.extname(f)] || "application/octet-stream" });
    r.end(d);
  });
}).listen(5185);
