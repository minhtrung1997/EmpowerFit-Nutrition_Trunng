# Deployment Guide — Heroku

## Architecture

```
Internet → Heroku App (https://your-app.herokuapp.com)
             └── python3 server.py (port $PORT)
                  ├── Static files
                  └── /api/vn-food proxy → viendinhduong.vn
```

## Prerequisites

- Heroku account (free at heroku.com — requires credit card for verification)
- Heroku CLI installed: `curl https://cli-assets.heroku.com/install.sh | sh`
- Git installed
- App repo committed

## Step 1: Prepare Heroku Files

### `Procfile` (create in project root)

```
web: python3 server.py
```

### `runtime.txt` (create in project root)

```
python-3.12.0
```

### Modify `server.py` to use `$PORT`

Heroku assigns a dynamic port via environment variable. Change the last line:

```python
import os
port = int(os.environ.get('PORT', 8000))
http.server.HTTPServer(('', port), Handler).serve_forever()
```

Full modified `server.py`:

```python
#!/usr/bin/env python3
"""Static file server + CORS proxy for viendinhduong.vn API."""
import http.server, urllib.request, json, os
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
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting server on port {port}")
    http.server.HTTPServer(('', port), Handler).serve_forever()
```

## Step 2: Login & Create App

```bash
heroku login
heroku create house-of-health-pro
# Output: https://house-of-health-pro.herokuapp.com
```

> If name is taken, try: `heroku create` (auto-generates name)

## Step 3: Deploy

```bash
git add -A
git commit -m "Deploy to Heroku"
git push heroku main
```

> If your branch is not `main`:
> ```bash
> git push heroku your-branch:main
> ```

## Step 4: Verify

```bash
heroku open
# or
curl -s -o /dev/null -w "%{http_code}" https://house-of-health-pro.herokuapp.com/
```

Test VN food proxy:
```bash
curl -s "https://house-of-health-pro.herokuapp.com/api/vn-food?page=1&name=pho" | python3 -c "import json,sys;print(json.load(sys.stdin)['total'],'results')"
```

## Step 5: Custom Domain (Optional)

```bash
# Add your domain
heroku domains:add www.yourdomain.com
heroku domains:add yourdomain.com

# Get DNS target
heroku domains
# Output shows DNS target like: xxx.herokudns.com
```

Then at your domain registrar, add:
- CNAME `www` → `xxx.herokudns.com`
- ALIAS/ANAME `@` → `xxx.herokudns.com` (or use redirect)

### SSL (automatic on Heroku)
Heroku provides free SSL for custom domains automatically (ACM - Automated Certificate Management).

```bash
heroku certs:auto:enable
```

---

## Redeploy

```bash
git add -A
git commit -m "Update: description of change"
git push heroku main
```

One-liner:
```bash
git add -A && git commit -m "Update" && git push heroku main
```

## View Logs

```bash
heroku logs --tail
```

## Restart

```bash
heroku restart
```

---

## Cleanup

```bash
# Delete the app entirely
heroku apps:destroy house-of-health-pro --confirm house-of-health-pro

# Remove heroku remote
git remote remove heroku
```

---

## Blockers & Workarounds

| Blocker | Workaround |
|---------|-----------|
| Heroku free tier removed (Nov 2022) | Use Eco/Basic plan ($5-7/month) or use alternatives: Render, Railway, Fly.io (free tiers) |
| App sleeps after 30 min inactivity (Eco) | Upgrade to Basic ($7/mo) or use UptimeRobot to ping every 25 min |
| `$PORT` not set locally | Default to 8000 in code: `os.environ.get('PORT', 8000)` |
| Large files rejected by git push | Exclude `raw_data/FoodData*` in `.gitignore` |
| Heroku doesn't persist filesystem writes | Not an issue — app uses client-side localStorage |
| Build fails | Check `runtime.txt` matches available Python version: `heroku buildpacks` |

## `.gitignore` (recommended)

```
raw_data/FoodData_Central_foundation_food_json_2025-12-18.json
__pycache__/
*.pyc
.env
```

---

## Alternative Free Platforms

If Heroku pricing is a concern:

| Platform | Free Tier | Deploy Command |
|----------|-----------|----------------|
| **Render** | Yes (750 hrs/mo) | Connect GitHub repo, auto-deploys |
| **Railway** | $5 credit/mo | `railway up` |
| **Fly.io** | 3 shared VMs free | `fly launch && fly deploy` |
| **Vercel** | Yes (serverless) | Needs code restructure for serverless |
| **GitHub Pages** | Yes (static only) | No VN food proxy support |

---

## Notes

- Heroku provides HTTPS automatically — no certbot needed
- The VN food proxy works because Heroku has outbound internet access
- App size is well within Heroku's 500MB slug limit
- No database needed — all state is client-side localStorage
- For Vietnam users, Heroku's US/EU servers add ~200ms latency to the VN food API; acceptable for search-as-you-type with 400ms debounce
