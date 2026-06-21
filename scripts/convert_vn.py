#!/usr/bin/env python3
"""Convert Vietnamese nutrition database JSON to foods.js entries and merge."""
import json, re

CATEGORY_MAP = {
    'Ngũ cốc và sản phẩm chế biến từ chúng': 'Carbs',
    'Khoai củ và các sản phẩm chế biến từ chúng': 'Carbs',
    'Hạt, quả giàu protein, chất béo và chế phẩm': 'Fats',
    'THỊT VÀ SẢN PHẨM CHẾ BIẾN': 'Protein',
    'THỦY SẢN VÀ SẢN PHẨM CHẾ BIẾN': 'Protein',
    'TRỨNG VÀ SẢN PHẨM CHẾ BIẾN': 'Protein',
    'SỮA VÀ SẢN PHẨM CHẾ BIẾN': 'Protein',
    'ĐỒ HỘP': 'Extras',
    'ĐỒ NGỌT (ĐƯỜNG, BÁNH, MỨT, KẸO)': 'Extras',
    'GIA VỊ, NƯỚC CHẤM': 'Extras',
    'NƯỚC GIẢI KHÁT': 'Extras',
}

def to_num(v):
    if v is None: return 0
    if isinstance(v, (int, float)): return v
    m = re.search(r'[\d.]+', str(v))
    if m:
        val = float(m.group())
        if 'g' in str(v) and 'mg' not in str(v):
            val *= 1000
        return val
    return 0

with open("raw_data/thanh phan dinh duong.json") as f:
    data = json.load(f)

entries = []
for food in data["foods"]:
    if food.get("category") is None:
        continue
    name = food["name"].replace('"', '\\"')
    cat = CATEGORY_MAP.get(food["category"], "Extras")
    protein = round(to_num(food.get("protein")), 1)
    carbs = round(to_num(food.get("carbohydrates")), 1)
    fat = round(to_num(food.get("fat")), 1)
    fibre = round(to_num(food.get("fibre")), 1)
    sodium = int(round(to_num(food.get("sodium"))))
    calories = int(round(to_num(food.get("calories"))))
    entries.append(
        f'  "{name} (VN)": {{ protein: {protein}, carbs: {carbs}, fat: {fat}, fibre: {fibre}, sodium: {sodium}, calories: {calories}, category: "{cat}", unit: "g" }}'
    )

with open("js/foods.js") as f:
    content = f.read()

insert_pos = content.index("};")
before = content[:insert_pos].rstrip()
if not before.endswith(","):
    before += ","

vn_block = "\n\n  // ========== VIETNAMESE FOOD DATABASE ==========\n" + ",\n".join(entries) + "\n"
new_content = before + vn_block + content[insert_pos:]

with open("js/foods.js", "w") as f:
    f.write(new_content)

print(f"Merged {len(entries)} Vietnamese foods into js/foods.js")
