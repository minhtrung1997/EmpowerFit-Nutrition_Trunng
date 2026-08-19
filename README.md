# EmpowerFit Nutrition Planner

A responsive nutrition-planning app for Vietnamese health coaches. It combines goal-based macro targets, meal planning, cooking adjustments, and Vietnamese food search in one browser interface.

## Highlights

- Herbalife Coach and Mifflin–St Jeor target formulas
- Six meal slots with live macro totals
- Local food database plus Vietnamese food API search
- Coach notes, client PDF, diary, and calculation log
- Light and dark themes
- Browser storage that preserves plans across refreshes and restarts

## Run locally

Requires Python 3.13 or another recent Python 3 release.

```bash
python3 server.py
```

Open <http://localhost:8000>.

## Main files

```text
index.html       App interface
css/style.css    UI styles and themes
js/app.js        App behavior and calculations
js/foods.js      Local food database
server.py        Static server and Vietnamese food API proxy
```

## Data storage

Client details and meal plans are stored in the browser's `localStorage`. Data is tied to the browser profile and site address; clearing site data removes it.

## Deployment

Pushes to `main` deploy automatically through GitHub Actions when application code or assets change. See the [Heroku deployment guide](docs/DEPLOYMENT_HEROKU.md) for setup and troubleshooting.

## Contact

House of Health Well Pro — 85 Tan Cang St
