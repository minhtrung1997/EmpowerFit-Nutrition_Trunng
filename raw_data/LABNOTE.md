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

## 🍱 4. Open Food Facts

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
| Open Food Facts               | Packaged products              |
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
3. Add Open Food Facts Vietnam products
4. Create custom entries for common local dishes (cơm tấm, hủ tiếu, bún bò, phở, etc.)

That combination will cover about **95% of what a Vietnamese user actually eats** 🍚🥢.
