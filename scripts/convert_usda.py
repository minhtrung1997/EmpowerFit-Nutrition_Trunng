#!/usr/bin/env python3
"""Convert USDA FoodData Central JSON to foods.js entries and merge."""
import json, re

CATEGORY_MAP = {
    "Beef Products": "Protein",
    "Poultry Products": "Protein",
    "Pork Products": "Protein",
    "Lamb, Veal, and Game Products": "Protein",
    "Finfish and Shellfish Products": "Protein",
    "Sausages and Luncheon Meats": "Protein",
    "Dairy and Egg Products": "Protein",
    "Legumes and Legume Products": "Protein",
    "Cereal Grains and Pasta": "Carbs",
    "Baked Products": "Carbs",
    "Fruits and Fruit Juices": "Carbs",
    "Vegetables and Vegetable Products": "Vegetables",
    "Nut and Seed Products": "Fats",
    "Fats and Oils": "Fats",
    "Spices and Herbs": "Extras",
    "Sweets": "Extras",
    "Beverages": "Extras",
    "Soups, Sauces, and Gravies": "Extras",
    "Restaurant Foods": "Extras",
}

ENERGY_IDS = [1008, 2047, 2048]

with open("raw_data/FoodData_Central_foundation_food_json_2025-12-18.json") as f:
    foods = json.load(f)["FoundationFoods"]

entries = []
for food in foods:
    nutrients = {}
    for n in food["foodNutrients"]:
        nutrients[n["nutrient"]["id"]] = n.get("amount") or 0

    protein = nutrients.get(1003)
    fat = nutrients.get(1004)
    carbs = nutrients.get(1005)
    if protein is None or fat is None or carbs is None:
        continue

    energy = next((nutrients[eid] for eid in ENERGY_IDS if nutrients.get(eid)), None)
    if not energy:
        continue

    fibre = round(nutrients.get(1079) or 0, 1)
    sodium = round(nutrients.get(1093) or 0, 0)
    cat = CATEGORY_MAP.get(food.get("foodCategory", {}).get("description", ""), "Extras")

    name = food["description"].replace('"', '\\"')
    entries.append(
        f'  "{name} (USDA)": {{ protein: {round(protein,1)}, carbs: {round(carbs,1)}, '
        f'fat: {round(fat,1)}, fibre: {fibre}, sodium: {int(sodium)}, '
        f'calories: {int(round(energy))}, category: "{cat}", unit: "g" }}'
    )

# Read existing foods.js and insert before closing of FOOD_DATABASE
with open("js/foods.js") as f:
    content = f.read()

# Find first `};` which closes FOOD_DATABASE
insert_pos = content.index("};")
# Find the last entry line before `};`
before = content[:insert_pos].rstrip()
# Add comma if needed
if not before.endswith(","):
    before += ","

usda_block = "\n\n  // ========== USDA FOUNDATION FOODS ==========\n" + ",\n".join(entries) + "\n"

new_content = before + usda_block + content[insert_pos:]

with open("js/foods.js", "w") as f:
    f.write(new_content)

print(f"Merged {len(entries)} USDA foods into js/foods.js")
