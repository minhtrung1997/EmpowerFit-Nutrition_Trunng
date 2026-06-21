# Spec: function_calibration

## Overview

A cooking/processing calibration module that adjusts raw food database values to reflect actual nutrient availability after preparation. This bridges the gap between "per 100g raw" database entries and what the client actually consumes (cooked, stored, fried, etc.).

## Problem

Currently the app uses raw/label values from FOOD_DATABASE. When a coach enters "200g chicken breast", the macros shown are for raw chicken — but the client eats cooked chicken, which has different weight (yield) and nutrient density. The same applies to rice (water absorption), fried foods (oil uptake), and cooled starches (resistant starch formation).

## Core Formulas (from Macronutrient Research)

### 1. Nutrient Retention Factor (RF)

From USDA True Retention:

```
%TR = (Nc × Gc) / (Nr × Gr) × 100
RF = %TR / 100
nutrient_processed = nutrient_raw × RF
```

Where `Nc/Nr` = concentration cooked/raw, `Gc/Gr` = mass cooked/raw.

### 2. Cooking Yield (Y)

```
Y = Gc / Gr
nutrient_per_100g_cooked = (nutrient_raw_per_100g × RF) / Y
```

### 3. Oil Uptake (frying)

```
fat_processed = fat_raw × RF_fat + U_oil
energy_increase ≈ U_oil × 9 kcal
```

Defaults:
- Pan-fry: U_oil = 4 g/100g raw
- Deep-fry (potato): U_oil = 5 g/100g raw
- Deep-fry (battered): U_oil = 7 g/100g raw

### 4. Energy Calculation

Label-compatible (Atwater):
```
E_label = 4P + 9F + 4AC
```

Advanced (NME with fibre):
```
E_NME = 3.2P + 8.7F + 4AC + 1.5DF + 6.2Alc
```

### 5. Resistant Starch (cold storage)

```
AC_effective = AC - RS_increase
ΔE ≈ 2.0 × ΔRS (ME) or 2.5 × ΔRS (NME)
```

Example: white rice cooked → cooled 24h at 4°C → reheated: RS increases ~1.01 g/100g, reducing ~2 kcal/100g.

## Retention Factor Defaults

| Food Group + Method | Protein | Fat | Carbs | Key Minerals |
|---|---|---|---|---|
| Leafy veg, boiled, drained | 0.90 | 0.90 | 0.90 | K:0.50, Mg:0.60, Ca:0.95 |
| Leafy veg, steamed | 0.95 | 0.95 | 0.95 | K:0.85, Mg:0.90 |
| Cereals/grains, boiled | 0.95 | 0.90 | 0.95 | ash:0.70 |
| Pasta/noodle, boiled | ~1.00 | ~1.00 | 0.95 | Na:0.50, K:0.60 |
| Potato, boiled/steamed | ~1.00 | ~1.00 | 0.90-1.00 | K:0.80-0.95 |
| Meat, general cooking | Use USDA retention table | | | |

## Yield Defaults

| Food | Yield (Gc/Gr) |
|---|---|
| Rice, boiled | 1.78 – 2.83 |
| Pasta, dry → boiled | 2.10 – 2.60 |
| Meat, grilled | 0.65 – 0.80 |
| Vegetables, boiled | 0.85 – 0.95 |

## Proposed Interface

```javascript
// User selects cooking method when adding food
addFoodItem(mealId, {
  food: "Chicken Breast (Raw)",
  grams: 200,               // raw weight input
  cookingMethod: "grilled"   // NEW: triggers calibration
});

// Calibration function
function calibrateMacros(foodName, gramsRaw, cookingMethod) {
  const raw = FOOD_DATABASE[foodName];
  const factors = COOKING_FACTORS[cookingMethod][foodCategory];
  // factors = { yield, rf_protein, rf_fat, rf_carbs, oil_uptake, rs_delta }

  const gramsCooked = gramsRaw * factors.yield;
  return {
    actualGramsEaten: gramsCooked,
    protein: raw.protein * (gramsRaw/100) * factors.rf_protein,
    fat: raw.fat * (gramsRaw/100) * factors.rf_fat + (factors.oil_uptake * gramsRaw/100),
    carbs: raw.carbs * (gramsRaw/100) * factors.rf_carbs - (factors.rs_delta * gramsRaw/100),
    calories: recalcFromMacros(...)
  };
}
```

## Cooking Methods to Support (v1)

1. **Raw/Label** (default, no adjustment)
2. **Boiled/Steamed** (yield + mineral leaching)
3. **Grilled/Roasted** (yield loss, fat drip)
4. **Pan-fried** (oil uptake 4g/100g)
5. **Deep-fried** (oil uptake 5-7g/100g)
6. **Cooked & cooled** (resistant starch modifier)

## UI Change

Add a dropdown next to the grams input:
```
[Food name] [200g] [Cooking: Grilled ▾] [Add]
```

## Scope for v1

- Focus on energy/macros only (protein, fat, carbs, calories)
- Use Bognar/USDA defaults — no individual body-type coefficients
- Mineral absorption factors (Ca, Mg, Fe) deferred to v2
- Protein quality (DIAAS/PDCAAS) deferred to v2

## Data Source

All coefficients from: `docs/Macronutrient_research_formulae.pdf` (indexed in knowledge base as `macronutrient_formulae`)

## Success Criteria

1. Coach enters "200g raw chicken breast, grilled" → app shows macros for ~150g cooked equivalent
2. Coach enters "80g dry pasta, boiled" → shows macros for ~190g cooked pasta
3. Coach enters "100g potato, deep fried" → adds ~45 kcal from oil uptake
4. Default "Raw/Label" mode behaves exactly as current app (no regression)

## Optional Calibrated Formulae (Extension Points)

The following are places where coaches or advanced users can override defaults with measured/calibrated values. Each has a fallback to the standard formula if no custom value is provided.

### 1. Custom Yield Factor

**Where**: Per food item or per recipe
**Default**: Lookup from YIELD_DEFAULTS table
**Override**: Coach weighs food before and after cooking

```javascript
// Coach measures: 200g raw chicken → 148g after grilling
customYield: 148 / 200  // = 0.74 (overrides default 0.70)
```

**Use case**: Coach notices their client's air fryer produces different yield than oven roasting.

---

### 2. Custom Oil Uptake

**Where**: Per cooking method, per food category
**Default**: Bognar values (4/5/7 g per 100g raw)
**Override**: Coach estimates or measures added oil actually absorbed

```javascript
// Vietnamese stir-fry with minimal oil
customOilUptake: 2.0  // g per 100g raw (overrides default 4.0 for pan-fry)
```

**Use case**: Health-conscious Vietnamese cooking uses less oil than Western frying defaults.

---

### 3. Custom Retention Factors

**Where**: Per nutrient, per cooking method, per food group
**Default**: USDA/Bognar RF tables
**Override**: From product-specific lab data or literature

```javascript
// Slow-cooked pork belly — more fat renders out than standard
customRF: {
  protein: 0.95,  // default
  fat: 0.75,      // more fat loss than standard 0.90
  carbs: 1.00     // no change
}
```

**Use case**: Specific Vietnamese dishes (thịt kho, cá kho tộ) with long braising where fat separation is visible.

---

### 4. Custom Resistant Starch Delta

**Where**: Per starch food, per storage condition
**Default**: ΔRS = 1.01 g/100g for rice cooled 24h at 4°C
**Override**: Different cooling durations or food types

```javascript
// Bún stored overnight in fridge
customRSDelta: 0.8  // g/100g (less data than rice, conservative estimate)
```

**Use case**: Coaches advising clients to eat cooled rice/noodles for lower glycemic impact.

---

### 5. Custom Energy Factors (replacing Atwater 4/9/4)

**Where**: Global setting or per food category
**Default**: Atwater general (4P + 9F + 4C)
**Override**: Atwater specific factors or NME system

```javascript
// Use NME (Net Metabolizable Energy) for more accurate tracking
customEnergyFormula: "NME"
// E = 3.2P + 8.7F + 4AC + 1.5DF + 6.2Alc

// Or Atwater specific factors for a food class
customAtwaterFactors: {
  protein: 3.47,  // e.g., hummus (legume-specific)
  fat: 8.37,
  carbs: 4.07
}
```

**Use case**: Advanced coaches wanting tighter calorie accuracy for contest prep athletes.

---

### 6. Custom Portion-to-Raw Conversion

**Where**: Per food, for common Vietnamese servings
**Default**: Calculated from yield
**Override**: Empirical serving weights

```javascript
// A standard phở bò bowl contains ~80g dry noodle equivalent
portionPresets: {
  "Phở bò (tô nhỏ)": { dryNoodleEquiv: 60, meatRaw: 80, broth: 300 },
  "Phở bò (tô lớn)": { dryNoodleEquiv: 100, meatRaw: 120, broth: 450 },
  "Cơm tấm (đĩa)":   { dryRiceEquiv: 100, meatRaw: 150 }
}
```

**Use case**: Coaches entering common Vietnamese meals without needing to weigh individual components.

---

### 7. Client-Specific Metabolic Calibration

**Where**: Per client profile (v2+)
**Default**: Standard Mifflin-St Jeor TDEE
**Override**: Coach adjusts based on observed weight change vs predicted

```javascript
// Client ate predicted 2000 kcal/day for 2 weeks but lost 0.5kg/week
// Expected maintenance was 2000 → actual TDEE likely ~2500
metabolicCalibration: {
  tdeeAdjustment: +500,  // or multiplier: 1.25
  source: "2-week weight tracking",
  date: "2026-06-21"
}
```

**Use case**: Coaches who track client weight over time and want to calibrate predictions against reality.

---

### Storage & Priority

All custom calibrations stored in a `CALIBRATION_OVERRIDES` object:

```javascript
const CALIBRATION_OVERRIDES = {
  // Priority: custom > food-specific > method-default > global-default
  foods: {
    "Chicken Breast (Raw)": {
      grilled: { yield: 0.74, rf_fat: 0.80 }
    }
  },
  methods: {
    "pan-fried": { oil_uptake: 2.0 }  // Vietnamese low-oil default
  },
  global: {
    energyFormula: "atwater",  // or "nme"
    rsEnabled: true
  }
};
```

Lookup order: `food+method specific` → `method override` → `built-in default`

---

### 8. Reverse Calibration from Coach Metrics (Day-Level Deduction)

**Where**: Per client, per day or per meal plan
**Trigger**: Coach has their own calculated totals (from experience, manual calc, or another tool) that differ from the app's raw/label output

**Problem**: Coach plans 5 meals for a client. The app (without calibration) shows 2200 kcal / 165g protein. But the coach knows from experience the actual intake is closer to 1950 kcal / 148g protein after cooking losses. We can reverse-engineer the calibration factors from this discrepancy.

**Input**:
```javascript
// App raw output for the day (no calibration)
appRaw: { calories: 2200, protein: 165, fat: 78, carbs: 245 }

// Coach's assessed actual values for the same meals
coachActual: { calories: 1950, protein: 148, fat: 65, carbs: 230 }
```

**Deduced calibration factors**:
```javascript
deducedFactors: {
  calories: 1950 / 2200,  // = 0.886
  protein:  148 / 165,    // = 0.897
  fat:      65 / 78,      // = 0.833
  carbs:    230 / 245     // = 0.939
}
```

**Interpretation**: On average across this client's meals, actual intake is ~89% of raw label calories, ~90% of label protein, ~83% of label fat — consistent with a mostly grilled/steamed meal plan where fat renders off.

**Usage**:
```javascript
// Coach enters a day plan, then inputs their expected totals
function reverseCalibrate(appTotals, coachTotals) {
  return {
    calorieFactor: coachTotals.calories / appTotals.calories,
    proteinFactor: coachTotals.protein / appTotals.protein,
    fatFactor: coachTotals.fat / appTotals.fat,
    carbsFactor: coachTotals.carbs / appTotals.carbs,
    date: new Date().toISOString(),
    mealCount: appTotals.mealCount
  };
}
```

**Stored per client**:
```javascript
clientCalibrationHistory: [
  { date: "2026-06-21", factors: { cal: 0.886, pro: 0.897, fat: 0.833, carb: 0.939 }, meals: 5 },
  { date: "2026-06-28", factors: { cal: 0.902, pro: 0.910, fat: 0.870, carb: 0.945 }, meals: 6 },
  // ...
]

// Running average becomes the client's personal calibration
clientDefaultFactors: {
  calories: 0.894,  // avg of history
  protein: 0.904,
  fat: 0.852,
  carbs: 0.942
}
```

**UI Flow**:

1. Coach builds day plan normally (3-6 meals) → app shows raw totals
2. Coach clicks **"Calibrate"** button
3. Modal appears with app totals pre-filled, coach enters their assessed actual values:
   ```
   ┌─────────────────────────────────────────────┐
   │  Day Calibration                            │
   │                                             │
   │            App (raw)    Coach (actual)       │
   │  Calories: [2200]      [____]               │
   │  Protein:  [165g]      [____]               │
   │  Fat:      [78g]       [____]               │
   │  Carbs:    [245g]      [____]               │
   │                                             │
   │  [Calculate Factors]  [Save to Client]      │
   └─────────────────────────────────────────────┘
   ```
4. App shows deduced factors + optional save to client profile
5. Next time this client's plan is generated, factors are auto-applied (toggleable)

**Application Mode**:
```javascript
// When calibration is active for a client
function getDisplayMacros(rawMacros, clientFactors) {
  if (!clientFactors) return rawMacros;  // no calibration = raw passthrough
  return {
    calories: Math.round(rawMacros.calories * clientFactors.calories),
    protein: Math.round(rawMacros.protein * clientFactors.protein * 10) / 10,
    fat: Math.round(rawMacros.fat * clientFactors.fat * 10) / 10,
    carbs: Math.round(rawMacros.carbs * clientFactors.carbs * 10) / 10
  };
}
```

**Guard rails**:
- Factors outside 0.70–1.30 range trigger a warning ("Unusual calibration — double check inputs")
- Minimum 3 meals in a day plan to produce a reliable calibration
- History-based averaging smooths out single-day anomalies
- Coach can reset/clear calibration at any time

**Use case**: Experienced Herbalife coaches who have developed intuition about real-world intake from hundreds of clients, and want the app to learn their assessment patterns per client type.

---

## Summary: App Calculation Modes (UI)

The app offers 3 calculation modes, selectable via a toggle in the UI header or per-client settings:

### Mode 1: Raw / Label (Default)

```
[● Raw/Label]  [ ] Default Calibration  [ ] Coach Calibration
```

- **What it does**: Uses food database values as-is (per 100g raw or per serving)
- **No adjustments** — pure label/USDA/VN database numbers
- **When to use**: Quick estimates, packaged foods, foods eaten raw, when coach doesn't need cooking-adjusted accuracy
- **Formula**: `macros = database_value × (grams / 100)`

---

### Mode 2: Default Calibration (Science-Based)

```
[ ] Raw/Label  [● Default Calibration]  [ ] Coach Calibration
```

- **What it does**: Applies cooking method adjustments using research-backed retention factors, yield, and oil uptake
- **Requires**: Coach selects a cooking method per food item (grilled, boiled, fried, etc.)
- **When to use**: When coach wants accurate per-food adjustments based on how the client actually prepares their food
- **Formula**: `macros = database_value × RF × (grams / 100)` + oil uptake if fried, recalc calories from adjusted macros
- **Factors from**: USDA retention tables, Bognar/FAO, Macronutrient Research PDF

---

### Mode 3: Coach Calibration (Experience-Based)

```
[ ] Raw/Label  [ ] Default Calibration  [● Coach Calibration]
```

- **What it does**: Applies per-client correction factors deduced from coach's historical assessments
- **Requires**: Coach has previously entered their assessed actual totals vs app raw totals (at least 1 day plan calibration)
- **When to use**: Experienced coaches who trust their own meal assessment over generic cooking factors; repeat clients with established patterns
- **Formula**: `macros = raw_value × client_factor` where factors are averaged from calibration history
- **Factors from**: Coach inputs (reverse-engineered from app raw vs coach actual)

---

### Comparison

| | Raw/Label | Default Calibration | Coach Calibration |
|---|---|---|---|
| Accuracy | Low (label only) | Medium-High (science) | High (personalized) |
| Setup effort | None | Select cooking method per food | Enter actual totals once per plan |
| Best for | Quick plans, packaged food | Detailed meal prep tracking | Repeat clients, experienced coaches |
| Adjusts per food | No | Yes (method-specific) | No (blanket day-level factor) |
| Learns over time | No | No | Yes (history averaging) |
| Can combine with others | — | Can feed into Coach Calibration | Uses Raw as baseline |

---

### UI Placement

```
┌──────────────────────────────────────────────────────┐
│  EmpowerFit Nutrition Planner                        │
│                                                      │
│  Client: [Nguyen Van A]  Goal: [Fat Loss ▾]         │
│                                                      │
│  Calculation Mode:                                   │
│  (●) Raw/Label  ( ) Calibrated  ( ) Coach-Tuned     │
│                                                      │
│  [When "Calibrated": cooking method dropdown shows]  │
│  [When "Coach-Tuned": factors badge + edit button]   │
└──────────────────────────────────────────────────────┘
```

### Mode Interaction

- Modes are **mutually exclusive** — only one active at a time
- **Coach Calibration** always multiplies against **Raw/Label** values (not against Default Calibration)
- If coach wants both (cooking-method precision + personal factor), use Default Calibration and then manually adjust client factors — this is a v2 enhancement
