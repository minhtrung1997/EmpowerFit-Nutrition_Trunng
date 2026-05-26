# EmpowerFit Nutrition Planner

A free, self-hosted nutrition planning web app for EmpowerFit Health coaches.

## Features
- TDEE calculation using Mifflin-St Jeor equation
- Macro targets: 2.2g protein/kg, 0.8g fat/kg, remaining calories to carbs
- 9 goal presets with calorie adjustments
- Australian food database (Coles, Woolworths, Aldi + whole foods)
- 6 meal slots (Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack/Shake)
- Real-time daily progress tracking
- Custom calorie override
- Branded PDF export for clients
- Micronutrient summary (fibre, sodium)
- Coach notes section on PDF

## Setup (GitHub Pages — Free Hosting)

### Step 1: Create GitHub Account
1. Go to https://github.com
2. Click "Sign up"
3. Create your free account

### Step 2: Create Repository
1. Click the green "New" button
2. Name it: `empowerfit-nutrition`
3. Set to **Public**
4. Click "Create repository"

### Step 3: Upload Files
1. In your new repo, click "uploading an existing file"
2. Upload ALL files maintaining this structure:
   ```
   index.html
   css/style.css
   js/foods.js
   js/app.js
   ```
3. Click "Commit changes"

### Step 4: Enable GitHub Pages
1. Go to repo **Settings**
2. Scroll to **Pages** (left sidebar)
3. Under "Source" select **Deploy from a branch**
4. Select branch: **main**, folder: **/ (root)**
5. Click **Save**

### Step 5: Access Your App
Your app will be live at:
`https://YOUR-USERNAME.github.io/empowerfit-nutrition`

(Takes 1-2 minutes to go live after saving)

## Usage
1. Enter client details (name, age, sex, weight, height, activity, goal)
2. Targets auto-calculate
3. Override calories if needed
4. Add foods to each meal slot using the search
5. Click "Generate & Download Client PDF"
6. Print or Save as PDF from your browser

## Updating the Food Database
Edit `js/foods.js` to add new foods following the existing format:
```javascript
"Food Name (Brand)": { 
  protein: 0, carbs: 0, fat: 0, fibre: 0, sodium: 0, calories: 0, 
  category: "Protein", // Protein, Carbs, Fats, Vegetables, Supplements, Extras
  unit: "g" // g or ml
},
```

## Contact
Marc Sandles — EmpowerFit Health
📞 0400 074 078
✉ Empowerfit77@gmail.com
Instagram: @Empower_FitPT
