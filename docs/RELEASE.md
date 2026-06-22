# Release Notes

## v1.0.0 — 2026-06-22

### 🎉 Initial Release

First production version of House of Health Well Pro Nutrition Planner.

### Features

**Core**
- Mifflin-St Jeor BMR + TDEE calculation
- 9 goal presets with calorie adjustments
- 6 meal slots with food search and real-time macro tracking
- Daily progress bars (calories, protein, carbs, fat)
- Custom calorie override

**Target Formulas**
- Herbalife Coach mode: 1.75g/kg protein, kcal/kg approach (26–38 by goal)
- Normal mode: 2.2g/kg protein, Mifflin-St Jeor + activity multiplier

**Food Calibration**
- Raw/Label: database values as-is (per 100g)
- Calibrated: cooking method selection (boiled, steamed, grilled, fried, cooled) with retention factors, yield, oil uptake from USDA/Bognar/FAO research
- Coach-Tuned: reverse-calibrate from coach's assessed actual vs app raw totals

**Food Database (553+ local)**
- 323 USDA Foundation Foods (2025)
- 162 Vietnamese Nutrition Institute foods
- 66 generic whole foods
- 2 Herbalife products (F1, PPP)

**Live Vietnamese Food Search (1,250+ dishes)**
- Real-time API proxy to viendinhduong.vn
- Debounced search (400ms)
- Results tagged with 🇻🇳 Online / Local labels
- In-memory cache for selected items

**Print / Export**
- Client PDF: branded summary with targets + meal plan
- Diary: full meal record with all dishes, amounts, cooking methods, modes
- Calculation Log: step-by-step formulae (BMR → TDEE → Target → Calibration)

**UI/UX**
- Herbalife green/white color palette
- Night mode toggle (persisted)
- Background image in header
- Custom Herbalife logo
- Mobile responsive (≤600px breakpoints)
- State auto-cached in localStorage
- Clear cache button for developers

### Tech Stack

- Pure HTML/CSS/JS (no framework, no build step)
- Python 3 HTTP server with CORS proxy
- No database required (client-side localStorage)

### Known Limitations

- VN food API data is per-portion (not always per 100g) — values may differ from standard tables
- No user accounts/login — single-user local app
- No offline mode for VN live search
- Coach-Tuned factors not yet averaged across multiple sessions (single calibration)

### Deployment

- Local: `python3 server.py` → http://localhost:8000
- AWS EC2: see docs/DEPLOYMENT.md
- Heroku: see docs/DEPLOYMENT_HEROKU.md
