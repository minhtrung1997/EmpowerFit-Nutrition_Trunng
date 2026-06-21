# EmpowerFit Nutrition Planner 🇻🇳

A free, self-hosted nutrition planning web app for Vietnamese health coaches.

## Live Features

- **TDEE calculation** using Mifflin-St Jeor equation
- **Dual target formula**: Normal (2.2g/kg protein) or Herbalife Coach (1.75g/kg, kcal/kg approach)
- **9 goal presets** with calorie adjustments (Fat Loss → Enhanced Athlete)
- **3 food calculation modes**: Raw/Label, Calibrated (cooking-adjusted), Coach-Tuned (experience-based)
- **553+ local foods** (USDA Foundation + Vietnamese Nutrition Institute + Herbalife)
- **1,250+ Vietnamese dishes live search** via viendinhduong.vn API proxy
- **6 meal slots** (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack)
- Real-time daily progress tracking with progress bars
- Custom calorie override
- Cooking method calibration (boiled, steamed, grilled, fried, cooled)
- Coach reverse-calibration from actual vs predicted totals
- State auto-cached in localStorage (persists across refreshes)
- Branded PDF export for clients
- Micronutrient summary (fibre, sodium)

## Quick Start

```bash
python3 server.py
# Open http://localhost:8000
```

> `server.py` serves static files + proxies Vietnamese food API (CORS bypass).

## Project Structure

```
├── index.html              # Single-page app
├── server.py               # Python HTTP server + /api/vn-food proxy
├── css/style.css           # Styles
├── js/
│   ├── app.js              # App logic, calibration, VN live search
│   └── foods.js            # Food database + cooking factors
├── docs/
│   ├── LABNOTE.md          # Development log & research notes
│   ├── Macronutrient_research_formulae.pdf  # Source research
│   └── specs/
│       └── function_calibration.md  # Calibration module spec
├── raw_data/
│   ├── FoodData_Central_foundation_food_json_2025-12-18.json  # USDA source
│   ├── thanh phan dinh duong.json   # VN nutrition institute source
│   └── convert_xls_to_json.py       # XLS→JSON converter
├── scripts/
│   ├── convert_usda.py     # USDA → foods.js merger
│   └── convert_vn.py       # VN data → foods.js merger
└── README.md
```

## Calculation Modes

### Target Formula (affects daily targets)
| Mode | Protein | Calories | Source |
|------|---------|----------|--------|
| Normal | 2.2 g/kg | Mifflin-St Jeor × activity + goal adj | Evidence-based |
| Herbalife Coach | 1.75 g/kg | kcal/kg (26–38 depending on goal) | Coach practice |

### Food Calibration (affects food macro display)
| Mode | What it does |
|------|-------------|
| Raw/Label | Database values as-is (per 100g) |
| Calibrated | Applies cooking retention factors, yield, oil uptake |
| Coach-Tuned | Blanket correction factors from coach's assessed totals |

## Food Database Sources

| Source | Foods | Type |
|--------|-------|------|
| USDA Foundation Foods 2025 | 323 | Per 100g, generic whole foods |
| Vietnamese Nutrition Institute | 162 | Per 100g, traditional VN ingredients |
| Herbalife (F1, PPP) | 2 | Per 100g powder |
| Original (generic) | 66 | Per 100g, common items |
| **viendinhduong.vn live API** | **1,250+** | Per 100g, VN dishes (online) |

## Updating the Food Database

Edit `js/foods.js` or re-run conversion scripts:

```bash
python3 scripts/convert_usda.py   # Re-merge USDA data
python3 scripts/convert_vn.py     # Re-merge VN data
```

Manual entry format:
```javascript
"Food Name": { protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0, calories: 0, category: "Protein", unit: "g" },
```

Categories: `Protein`, `Carbs`, `Fats`, `Vegetables`, `Extras`

## Development Notes

See [docs/LABNOTE.md](docs/LABNOTE.md) for full development history and research notes.

See [docs/specs/function_calibration.md](docs/specs/function_calibration.md) for the calibration module specification.

## Deploy (GitHub Pages)

1. Push to GitHub (public repo)
2. Settings → Pages → Deploy from branch: `main`, folder: `/`
3. Live at `https://YOUR-USERNAME.github.io/REPO-NAME`

> **Note**: GitHub Pages won't support the VN live proxy. For full functionality, deploy with a backend (e.g., AWS Lambda, Vercel serverless function).

## Contact

EmpowerFit Health
📞 0400 074 078
✉ Empowerfit77@gmail.com
