#!/usr/bin/env python3
"""Static file server + CORS proxy for viendinhduong.vn API."""
import http.server, urllib.request, json
from urllib.parse import urlparse, parse_qs

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/vn-food?'):
            query = parse_qs(urlparse(self.path).query)
            name = query.get('name', [''])[0]
            page = query.get('page', ['1'])[0]
            url = f"https://viendinhduong.vn/api/fe/tool/getPageFoodData?page={page}&pageSize=8&name={urllib.parse.quote(name)}"
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
            except Exception as e:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            super().do_GET()

if __name__ == '__main__':
    http.server.HTTPServer(('', 8000), Handler).serve_forever()
