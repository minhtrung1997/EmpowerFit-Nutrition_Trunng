# 🇻🇳 House of Health Well Pro — Nutrition Planner

A self-hosted nutrition planning web app for Vietnamese health coaches, powered by Herbalife-style meal planning and a live Vietnamese food database.

## Features

- **Dual target formula**: Herbalife Coach (1.75g/kg, kcal/kg) or Normal (2.2g/kg, Mifflin-St Jeor)
- **3 food calibration modes**: Raw/Label, Calibrated (cooking-adjusted), Coach-Tuned (reverse-calibrated)
- **553+ local foods** (USDA + Vietnamese Nutrition Institute + Herbalife F1/PPP)
- **1,250+ Vietnamese dishes** via live search (viendinhduong.vn API)
- **9 goal presets** (Fat Loss → Enhanced Athlete)
- **6 meal slots** with real-time progress tracking
- **Night mode** toggle
- **3 print outputs**: Client PDF, Diary record, Calculation Log
- **Mobile responsive**
- **State cached** in localStorage (persists across refreshes)

## Quick Start

```bash
python3 server.py
# Open http://localhost:8000
```

## Project Structure

```
├── index.html              # Single-page app
├── server.py               # HTTP server + /api/vn-food proxy
├── css/style.css           # Styles (light + dark theme)
├── js/
│   ├── app.js              # App logic, calibration, VN search, print
│   └── foods.js            # Food database + cooking factors
├── docs/
│   ├── LABNOTE.md          # Development log
│   ├── DEPLOYMENT.md       # AWS deployment guide
│   ├── DEPLOYMENT_HEROKU.md # Heroku deployment guide
│   ├── RELEASE.md          # Release notes
│   ├── Macronutrient_research_formulae.pdf
│   ├── images/             # Logo + background
│   └── specs/
│       └── function_calibration.md
├── raw_data/               # Source databases
├── scripts/                # DB conversion scripts
└── README.md
```

## Calculation Modes

| Target Formula | Protein | Calories |
|---|---|---|
| Herbalife Coach | 1.75 g/kg | kcal/kg (26–38 by goal) |
| Normal | 2.2 g/kg | Mifflin-St Jeor × activity + goal adj |

| Food Calibration | Effect |
|---|---|
| Raw/Label | Database values as-is |
| Calibrated | Cooking retention factors + yield + oil uptake |
| Coach-Tuned | Blanket correction from coach's assessed totals |

## Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (AWS) or [docs/DEPLOYMENT_HEROKU.md](docs/DEPLOYMENT_HEROKU.md) (Heroku).

## Contact

House of Health Well Pro
📍 85 Tan Cang St
