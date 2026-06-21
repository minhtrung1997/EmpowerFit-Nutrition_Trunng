Yes — but unfortunately there is **no USDA-quality, comprehensive, open database for Vietnamese foods** that is as complete and developer-friendly as USDA FoodData Central.

Here are the main options:

## 🇻🇳 1. Vietnamese Food Composition Database (Best Official Source)

- A research github: https://github.com/nguyenkhangme/Vietnamese-Food-Nutrition-Analysis
  Published by:

- National Institute of Nutrition (Viện Dinh dưỡng Quốc gia)

Contains:

- Thousands of Vietnamese foods
- Traditional dishes
- Raw ingredients
- Calories
- Protein, fat, carbs
- Vitamins and minerals

Examples:

- Phở bò
- Bún bò Huế
- Cơm tấm
- Chả giò
- Rau muống
- Cá kho tộ

### Pros

✅ Vietnam-specific foods
✅ Official nutrition data
✅ Used by nutrition professionals

### Cons

❌ Not freely available as a modern API
❌ Usually distributed as books, PDFs, Excel files
❌ Data structure is inconsistent compared with USDA

---

## 🌏 2. ASEAN Food Composition Database

Managed by:

ASEANFOODS

Contains foods from:

- Vietnam
- Thailand
- Malaysia
- Indonesia
- Philippines
- Singapore

### Pros

✅ Includes many Southeast Asian foods

### Cons

❌ Smaller than USDA
❌ Not developer-focused

---

## 🍜 3. FatSecret API

For an app project, this is often the most practical.

[FatSecret Platform](https://platform.fatsecret.com?utm_source=chatgpt.com)

Contains:

- Large number of Vietnamese dishes
- User-submitted foods
- Restaurant foods
- Barcode products sold in Vietnam

Examples I've seen:

- Phở bò
- Bánh mì thịt
- Bún chả
- Trà sữa
- Highlands Coffee products

### Pros

✅ API available
✅ Good coverage of Asian foods
✅ Production-ready

### Cons

❌ Community data quality varies

---

~~ ## 🍱 4. Open Food Facts ~~

[Open Food Facts](https://world.openfoodfacts.org?utm_source=chatgpt.com)

Contains:

- Vietnamese packaged products
- Convenience store foods
- Imported foods

### Pros

✅ Free
✅ Open API
✅ Barcode lookup

### Cons

❌ Weak coverage of homemade dishes

---

## 🤖 What most calorie-tracking apps actually do

The best approach is usually a hybrid:

| Source                        | Use For                        |
| ----------------------------- | ------------------------------ |
| USDA                          | Ingredients                    |
| Vietnamese composition tables | Traditional dishes             |
| ~~Open Food Facts~~           | ~~Packaged products~~          |
| FatSecret                     | User search & restaurant foods |

For example:

| Food                | Source                       |
| ------------------- | ---------------------------- |
| 100g chicken breast | USDA                         |
| Rau muống luộc      | Vietnam database             |
| Phở bò              | Vietnam database / FatSecret |
| Vinamilk yogurt     | Open Food Facts              |
| Highlands Freeze    | FatSecret                    |

---

Since you've been tracking calories and protein quite consistently, if you're planning to build your own nutrition database or app, I'd recommend:

1. USDA as the backbone (≈400k foods)
2. Add Vietnamese Food Composition data
3. Create custom entries for common local dishes (cơm tấm, hủ tiếu, bún bò, phở, etc.)

That combination will cover about **95% of what a Vietnamese user actually eats** 🍚🥢.

## Cập nhật ngày 9/6/2026

- Bỏ qua foodbCa vì database quá lớn và có vẻ ko truy vấn được nhiều
- Tổng hợp thông tin bằng chatGPT plus để có công thức mô hình hao hụt có kiểm chứng và đưa được vào app
- FastSecret is on testing phase local to see if it can add any value to the db curation

## Cập nhật ngày 20/6/2026

### Database consolidation
- Checked & merged **USDA Foundation Foods** (323 items) into `js/foods.js` via `scripts/convert_usda.py`
- Checked & merged **Vietnamese Nutrition Institute data** (162 items) from `thanh phan dinh duong.json` via `scripts/convert_vn.py`
- Added **Herbalife F1** (90 kcal/9g protein per 25g serving) and **PPP Formula 3** (20 kcal/5g protein per 6g serving) manually
- Removed 30 Australian brand entries (Coles, Woolworths, Aldi, etc.) — app now Vietnam-focused
- Replaced all Australia/Australian references with Vietnam/Vietnamese across the project
- Total local database: **553 foods**

### USDA Branded Foods (454K items)
- Downloaded 194MB zip (3.3GB JSON) — same format as Foundation Foods
- Too large to merge entirely; intended to extract specific products (Herbalife, fish cake, etc.)
- Extraction interrupted — Herbalife added manually instead

### Live Vietnamese food lookup (viendinhduong.vn)
- Discovered **open API** at National Institute of Nutrition website (no auth required)
  - `GET /api/fe/tool/getPageFoodData?page=1&pageSize=8&name={query}` → 1,250 Vietnamese dishes
  - `GET /api/fe/tool/apiGetListFoodCategory` → all food categories
  - Data includes: calories, protein, fat, carbs, sodium, vitamins, minerals per serving
- Built **local proxy server** (`server.py`) to bypass CORS restriction (`access-control-allow-origin: https://viendinhduong.vn`)
- Integrated **live search** into the webapp:
  - Local results appear instantly with `Local` tag
  - VN online dishes appear after 400ms debounce with `🇻🇳 Online` tag
  - VN dishes are per-serving (amount defaults to 1 serving when selected)
  - Results cached in-memory for reuse
- Run app with `python3 server.py` instead of `python3 -m http.server 8000`

### Architecture note
- App now uses hybrid approach: local DB (per 100g) + live API (per serving)
- `server.py` serves static files + proxies `/api/vn-food?name=...` to viendinhduong.vn

## Cập nhật ngày 21/6/2026

### Spec: function_calibration (cooking/processing adjustment)
- Created `docs/specs/function_calibration.md` — spec for nutrient calibration based on cooking method
- All formulas sourced from indexed knowledge base (`macronutrient_formulae` / `docs/Macronutrient_research_formulae.pdf`)

### Key insight: Cooking does NOT always = more calories, less protein

Common Herbalife coach belief: "Cooked/processed food has more calories and less protein than raw"

**Reality from the research:**

| Cooking method | Calories | Protein (per batch) | Why |
|---|---|---|---|
| Raw → Grilled/Roasted | ↓ LESS | ≈ same (~95% retained) | Fat and water drip off, reducing total energy |
| Raw → Pan-fried | ↑ MORE (+36 kcal/100g raw) | ≈ same | Oil absorbed into food adds fat calories |
| Raw → Deep-fried | ↑↑ MORE (+45-63 kcal/100g raw) | ≈ same | More oil absorbed |
| Raw → Boiled (meat) | ↓ slightly less | ≈ same (RF 0.90-0.95) | Some fat leaches into water |
| Raw → Boiled (rice/noodles) | ≈ same total, but ↓ per 100g served | ↓ per 100g served (NOT destroyed) | Water absorbed dilutes everything per-weight |
| Cooked → Cooled 24h → Reheated | ↓ slightly (~2 kcal/100g) | ≈ same | Resistant starch forms, reducing available carbs |

### The confusion explained

Coaches are right that a **bowl of fried rice** has more calories than a **bowl of plain steamed rice** — but that's because of added oil, not because "cooking adds calories." Meanwhile, **grilled chicken** actually has FEWER calories than the raw weight suggests because fat renders out.

The per-100g-cooked values for starchy foods (rice, noodles) look lower in protein because water absorption increases the weight 2-3x — the protein isn't lost, it's just diluted across more grams.

### Correct coaching framework

1. **Grilled/steamed** = generally LESS calories than raw label suggests (good for fat loss clients)
2. **Fried** = MORE calories due to oil uptake (caution for fat loss clients)
3. **Rice/noodle portions** = track by DRY weight if possible, or multiply cooked weight ÷ yield (2.0-2.8) to get equivalent raw weight
4. **Cooled starches** (cơm nguội, bún để tủ lạnh) = marginally fewer calories, lower glycemic response — a free bonus for clients

### Formulas used (Atwater)
```
Calories = 4 × Protein(g) + 9 × Fat(g) + 4 × Available_Carbs(g)
```
Calories after cooking are recalculated from adjusted macros — NOT from a blanket "cooking factor" on the original calories.
