# Maintenance & Scale-Up Guide

For a team of 1 IT developer + 4-5 Herbalife coaches.

---

## Team Roles

| Person | Responsibilities |
|--------|-----------------|
| **IT (you)** | Deploy, fix bugs, add features, manage server, update food database |
| **Coaches** | Use the app daily, report issues, request features, provide calibration data |

---

## 1. Maintenance (Weekly)

### IT Tasks
- [ ] Check server is running (`curl http://your-server/`)
- [ ] Check VN food API still responds (`/api/vn-food?name=pho`)
- [ ] Review any coach-reported bugs
- [ ] Clear old localStorage if coaches report strange behavior

### Monthly
- [ ] Update food database if new products added (edit `js/foods.js`)
- [ ] Backup the codebase (`git push`)
- [ ] Check if viendinhduong.vn API has changed structure

### If something breaks
```bash
# Redeploy (fixes most issues)
ssh your-server
cd /opt/nutrition-app
git pull
pkill -f server.py
nohup python3 server.py &
```

---

## 2. Coach User Guide (share with coaches)

### Getting Started
1. Open the app URL in Chrome/Safari
2. Fill in client details (name, weight, height, age, sex, activity, goal)
3. Select **Herbalife Coach** formula (default)
4. Add foods to each meal using the search box
5. Type Vietnamese or English food names — online results appear after a moment
6. Enter grams (or ml for liquids)
7. Watch progress bars fill toward targets

### Key Tips for Coaches
- **Herbalife Coach mode** uses your familiar 1.75g/kg protein formula
- **Coach-Tuned mode**: After planning meals, click "⚙ Set Factors" to enter your assessed totals — the app learns your correction
- **Night mode**: Moon icon in header
- **Print options**: Client PDF (for client), Diary (for your records), Calc Log (for verification)
- **Clear Cache**: Bottom button — use if the app behaves strangely after an update

### Common Issues
| Problem | Fix |
|---------|-----|
| Foods not showing | Check internet connection (VN search needs internet) |
| Numbers look wrong after reload | Click "Clear Cache & Reload" |
| App blank on phone | Hard refresh (pull down to refresh) |
| PDF not opening | Allow popups in browser |

---

## 3. Research & Database Updates

### Adding New Foods
Edit `js/foods.js`, add entry:
```javascript
"Tên thực phẩm": { protein: X, carbs: X, fat: X, fibre: X, sodium: X, calories: X, category: "Protein", unit: "g" },
```
Categories: `Protein`, `Carbs`, `Fats`, `Vegetables`, `Extras`

### Adding Herbalife Products
When new products launch, add with per-100g values:
```javascript
"Herbalife Product Name": { protein: X, carbs: X, fat: X, fibre: 0, sodium: X, calories: X, category: "Protein", unit: "g" },
```

### Research Sources
- **Vietnamese foods**: viendinhduong.vn (already integrated live)
- **USDA updates**: fdc.nal.usda.gov (re-run `scripts/convert_usda.py`)
- **Herbalife labels**: Check product packaging for Vietnam-specific formulations
- **Cooking factors**: `docs/Macronutrient_research_formulae.pdf` (indexed in knowledge base)

---

## 4. Feature Roadmap (v2)

### Short-term (1-2 months)
| Feature | Effort | Value |
|---------|--------|-------|
| Vietnamese language toggle | 2 days | High — coaches prefer Vietnamese UI |
| Portion presets (1 bowl phở = 400g) | 1 day | High — saves time |
| Favourite foods per coach | 1 day | Medium — faster meal planning |
| Export to Excel | 1 day | Medium — coaches like spreadsheets |

### Medium-term (3-6 months)
| Feature | Effort | Value |
|---------|--------|-------|
| User accounts (login) | 1 week | High — each coach saves their clients |
| Client history (track weight over time) | 1 week | High — show progress |
| Recipe builder (combine foods into meals) | 3 days | High — reusable meal templates |
| Mineral/vitamin tracking | 2 days | Medium — for detailed plans |

### Long-term (6-12 months)
| Feature | Effort | Value |
|---------|--------|-------|
| Mobile app (PWA) | 2 weeks | High — offline + install on phone |
| AI meal suggestion ("suggest 500kcal lunch") | 1 week | High — powered by GPT/Claude API |
| Multi-language (EN/VN) | 3 days | Medium |
| Admin dashboard (usage stats) | 1 week | Low — nice to have |

---

## 5. Scaling for 5 Coaches

### Current Architecture (works for 5 users)
```
Coach 1 (phone) ─┐
Coach 2 (laptop) ─┼── Server (1 instance) ── VN Food API
Coach 3 (tablet) ─┤
Coach 4 (phone) ──┤
Coach 5 (laptop) ─┘
```

**No database needed** — each coach's data stays in their own browser (localStorage). They don't interfere with each other.

### When to Scale Up

| Users | Architecture | Cost |
|-------|-------------|------|
| 1-10 | Single server, localStorage | $5-7/month |
| 10-50 | Add user accounts + database (PostgreSQL) | $15-30/month |
| 50+ | Load balancer + multiple servers | $50+/month |

### For 5 coaches specifically:
- **No scaling needed** — current setup handles it fine
- **Each coach bookmarks the URL** on their phone/laptop
- **Each coach's data is independent** (browser localStorage)
- **Downside**: If coach clears browser data or switches device, their meal plans are lost

### Future improvement for data persistence:
When you add user accounts, store data server-side in a JSON file per coach (simplest) or PostgreSQL (proper). This lets coaches access their data from any device.

---

## 6. Cost Estimate

### Hosting (pick one)
| Option | Cost | Uptime |
|--------|------|--------|
| Render free | $0 | Sleeps after 15min |
| Fly.io free | $0 | Always on (Singapore) |
| Heroku Basic | $7/month | Always on |
| AWS EC2 t3.micro | $8/month | Always on |
| Oracle Cloud | $0 | Always on (forever free) |

### Domain + SSL
| Item | Cost |
|------|------|
| Domain (.link or .site) | $3-5/year |
| SSL (Let's Encrypt) | Free |

### Total: $0-12/month for 5 coaches

---

## 7. Backup Strategy

```bash
# Weekly backup (IT runs this)
cd /path/to/EmpowerFit-Nutrition_Trunng
git add -A
git commit -m "backup $(date +%Y-%m-%d)"
git push
```

The entire app is in Git. If anything breaks, you can always:
```bash
git log --oneline          # see history
git checkout v1.0.0        # go back to stable version
```

---

## 8. Communication with Coaches

### Recommended Setup
- **WhatsApp/Zalo group**: Coaches report bugs, request features
- **Simple feedback form**: "What food is missing?" "What's confusing?"
- **Monthly 15-min call**: Show new features, collect feedback

### Coach Feedback Template
```
Tên coach: ___
Ngày: ___
Vấn đề / yêu cầu: ___
Mức độ quan trọng (1-5): ___
```

---

## 9. Security Notes

- **No sensitive data on server** — all client info stays in browser
- **No passwords** — no login system yet
- **API proxy**: viendinhduong.vn data is public, no auth needed
- **When you add login later**: Use HTTPS, hash passwords, never store them plain

---

## 10. Getting Help

| Need | Where |
|------|-------|
| Bug in code | Open Kiro CLI in the project, describe the bug |
| New feature | Open Kiro CLI, describe what you want |
| Nutrition research | ChatGPT/Claude — ask about formulas, then verify with literature |
| Deployment issues | Check `docs/DEPLOYMENT.md` or `docs/DEPLOYMENT_HEROKU.md` |
| AI/tool concepts | Read `docs/AI_BEGINNER_GUIDE.md` |
