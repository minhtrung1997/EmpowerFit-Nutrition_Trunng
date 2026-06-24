#!/usr/bin/env python3
"""Vietnamize USDA food names in js/foods.js.

Default behavior is safe: add Vietnamese aliases for USDA entries while keeping
the original English USDA names. Re-running the script replaces the generated
alias block instead of appending duplicates.

Examples:
  python3 scripts/vietnamize_usda.py --dry-run
  python3 scripts/vietnamize_usda.py --mode alias
  python3 scripts/vietnamize_usda.py --mode rename
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FOODS_JS = ROOT / "js" / "foods.js"
DEFAULT_CACHE = ROOT / "raw_data" / "usda_vi_translation_cache.json"

USDA_HEADER = "  // ========== USDA FOUNDATION FOODS =========="
VN_HEADER = "  // ========== VIETNAMESE FOOD DATABASE =========="
ALIAS_HEADER = "  // ========== USDA FOODS - VIETNAMESE ALIASES =========="
ALIAS_FOOTER = "  // ========== END USDA FOODS - VIETNAMESE ALIASES =========="

ENTRY_RE = re.compile(r'^(?P<indent>\s*)"(?P<name>(?:[^"\\]|\\.)+)":\s*(?P<body>\{.*\})(?P<comma>,?)\s*$')


PHRASE_MAP = {
    "without salt": "khong muoi",
    "with salt added": "co them muoi",
    "sunflower seed kernels": "nhan hat huong duong",
    "vitamin d fortified": "bo sung vitamin D",
    "vitamin a and vitamin d": "bo sung vitamin A va D",
    "commercially prepared": "che bien san",
    "ready-to-serve": "an lien",
    "regular pack": "dong hop thuong",
    "drained solids": "phan cai de rao",
    "low moisture": "it am",
    "part-skim": "tach beo mot phan",
    "lowfat": "it beo",
    "nonfat": "khong beo",
    "whole milk": "sua nguyen kem",
    "reduced fat": "giam beo",
    "fat free": "khong beo",
    "all-purpose": "da dung",
    "whole-wheat": "nguyen cam",
    "whole wheat": "nguyen cam",
    "breaded": "tam bot",
    "par fried": "chien so",
    "dry roasted": "rang kho",
    "pasteurized process": "che bien tiet trung",
    "pre-packaged": "dong goi san",
    "water added": "them nuoc",
    "canned in water": "dong hop ngam nuoc",
    "separable lean only": "chi phan nac",
    "trimmed to": "loc mo con",
    "bone-in": "co xuong",
    "boneless": "khong xuong",
    "skinless": "bo da",
    "meat only": "chi phan thit",
    "broilers or fryers": "ga thit",
    "broiler or fryers": "ga thit",
    "frozen": "dong lanh",
    "canned": "dong hop",
    "bottled": "dong chai",
    "commercial": "thuong mai",
    "restaurant": "nha hang",
    "prepared": "che bien",
    "unprepared": "chua che bien",
    "unheated": "chua ham nong",
    "heated": "ham nong",
    "pasteurized": "tiet trung",
    "cooked": "nau chin",
    "drained": "de rao",
    "boiled": "luoc",
    "braised": "ham",
    "roasted": "nuong",
    "grilled": "nuong vi",
    "pan-fried": "ap chao",
    "raw": "song",
    "dried": "say kho",
    "fresh": "tuoi",
    "plain": "nguyen vi",
    "sweet and sour": "chua ngot",
    "unsweetened": "khong duong",
    "light": "nhat",
    "white": "trang",
    "yellow": "vang",
    "green": "xanh",
    "red": "do",
    "grape": "bi",
    "oven": "lo nuong",
}

WORD_MAP = {
    "hummus": "sot hummus",
    "tomatoes": "ca chua",
    "tomato": "ca chua",
    "beans": "dau",
    "bean": "dau",
    "snap": "que",
    "frankfurter": "xuc xich frankfurter",
    "beef": "bo",
    "nuts": "hat",
    "almonds": "hanh nhan",
    "almond": "hanh nhan",
    "kale": "cai xoan",
    "egg": "trung",
    "eggs": "trung",
    "whole": "nguyen qua",
    "white": "long trang",
    "yolk": "long do",
    "onion": "hanh tay",
    "onions": "hanh tay",
    "rings": "khoanh",
    "pickles": "dua muoi",
    "cucumber": "dua leo",
    "dill": "thi la",
    "kosher": "kosher",
    "cheese": "pho mai",
    "parmesan": "parmesan",
    "grated": "bao soi",
    "american": "kieu My",
    "grapefruit": "buoi chum",
    "juice": "nuoc ep",
    "peaches": "dao",
    "peach": "dao",
    "seeds": "hat",
    "sunflower": "huong duong",
    "kernels": "nhan hat",
    "bread": "banh mi",
    "mustard": "mu tat",
    "kiwifruit": "kiwi",
    "nectarines": "xuan dao",
    "cheddar": "cheddar",
    "cottage": "cottage",
    "mozzarella": "mozzarella",
    "yogurt": "sua chua",
    "greek": "Hy Lap",
    "strawberry": "dau tay",
    "oil": "dau",
    "coconut": "dua",
    "chicken": "ga",
    "drumstick": "dui",
    "breast": "uc",
    "sauce": "sot",
    "pasta": "mi y",
    "spaghetti": "spaghetti",
    "marinara": "marinara",
    "ham": "jambon",
    "sliced": "cat lat",
    "olives": "o liu",
    "manzanilla": "manzanilla",
    "stuffed": "nhoi",
    "pimiento": "ot pimiento",
    "cookies": "banh quy",
    "oatmeal": "yen mach",
    "raisins": "nho kho",
    "fish": "ca",
    "haddock": "ca haddock",
    "pollock": "ca pollock",
    "tuna": "ca ngu",
    "rice": "com",
    "fried": "chien",
    "latino": "Latinh",
    "chinese": "Trung Hoa",
    "tamale": "tamale",
    "pork": "heo",
    "pupusas": "pupusas",
    "carrots": "ca rot",
    "carrot": "ca rot",
    "ricotta": "ricotta",
    "swiss": "Thuy Si",
    "figs": "sung",
    "lettuce": "xa lach",
    "romaine": "romaine",
    "melons": "dua",
    "cantaloupe": "dua luoi",
    "oranges": "cam",
    "milk": "sua",
    "pears": "le",
    "bartlett": "bartlett",
    "salsa": "salsa",
    "sausage": "xuc xich",
    "breakfast": "an sang",
    "italian": "Y",
    "mild": "vi nhe",
    "chorizo": "chorizo",
    "turkey": "ga tay",
    "sugars": "duong",
    "granulated": "hat",
    "broccoli": "bong cai xanh",
    "ketchup": "tuong ca",
    "flour": "bot",
    "wheat": "lua mi",
    "enriched": "bo sung vi chat",
    "bleached": "tay trang",
    "unbleached": "khong tay trang",
    "unenriched": "khong bo sung vi chat",
    "corn": "bap",
    "garlic": "toi",
    "soy": "dau nanh",
    "defatted": "tach beo",
    "full-fat": "nguyen beo",
    "brown": "nau",
    "round": "phan round",
    "loin": "than lung",
    "tenderloin": "than noi",
    "sirloin": "than ngoai",
    "porterhouse": "porterhouse",
    "steak": "bit tet",
    "roast": "mieng nuong",
    "short": "short",
    "top": "top",
    "eye": "eye",
    "choice": "choice",
    "select": "select",
    "restaurant": "nha hang",
}

DIACRITIC_MAP = {
    "bo sung vitamin A va D": "bổ sung vitamin A và D",
    "bo sung vitamin D": "bổ sung vitamin D",
    "bo sung vi chat": "bổ sung vi chất",
    "khong bo sung vi chat": "không bổ sung vi chất",
    "khong tay trang": "không tẩy trắng",
    "khong xuong": "không xương",
    "khong duong": "không đường",
    "khong muoi": "không muối",
    "khong beo": "không béo",
    "co them muoi": "có thêm muối",
    "them nuoc": "thêm nước",
    "dong hop ngam nuoc": "đóng hộp ngâm nước",
    "dong hop thuong": "đóng hộp thường",
    "phan cai de rao": "phần cái để ráo",
    "nhan hat huong duong": "nhân hạt hướng dương",
    "che bien tiet trung": "chế biến tiệt trùng",
    "che bien san": "chế biến sẵn",
    "che bien": "chế biến",
    "chua che bien": "chưa chế biến",
    "chua ham nong": "chưa hâm nóng",
    "ham nong": "hâm nóng",
    "nau chin": "nấu chín",
    "rang kho": "rang khô",
    "say kho": "sấy khô",
    "dong lanh": "đông lạnh",
    "dong chai": "đóng chai",
    "dong hop": "đóng hộp",
    "thuong mai": "thương mại",
    "nha hang": "nhà hàng",
    "tiet trung": "tiệt trùng",
    "de rao": "để ráo",
    "luoc": "luộc",
    "nuong vi": "nướng vỉ",
    "nuong": "nướng",
    "ap chao": "áp chảo",
    "song": "sống",
    "tuoi": "tươi",
    "nguyen vi": "nguyên vị",
    "chua ngot": "chua ngọt",
    "it am": "ít ẩm",
    "it beo": "ít béo",
    "tach beo mot phan": "tách béo một phần",
    "tach beo": "tách béo",
    "giam beo": "giảm béo",
    "nguyen kem": "nguyên kem",
    "nguyen beo": "nguyên béo",
    "nguyen cam": "nguyên cám",
    "nguyen qua": "nguyên quả",
    "tam bot": "tẩm bột",
    "chien so": "chiên sơ",
    "chien": "chiên",
    "da dung": "đa dụng",
    "loc mo con": "lọc mỡ còn",
    "co xuong": "có xương",
    "bo da": "bỏ da",
    "chi phan thit": "chỉ phần thịt",
    "chi phan nac": "chỉ phần nạc",
    "ga thit": "gà thịt",
    "trang": "trắng",
    "vang": "vàng",
    "xanh": "xanh",
    "do": "đỏ",
    "lo nuong": "lò nướng",
    "sot hummus": "sốt hummus",
    "sot": "sốt",
    "ca chua": "cà chua",
    "dau nanh": "đậu nành",
    "dau": "đậu",
    "xuc xich frankfurter": "xúc xích frankfurter",
    "xuc xich": "xúc xích",
    "bo": "bò",
    "hanh nhan": "hạnh nhân",
    "hat": "hạt",
    "hanh tay": "hành tây",
    "cai xoan": "cải xoăn",
    "trung": "trứng",
    "long trang": "lòng trắng",
    "long do": "lòng đỏ",
    "dua muoi": "dưa muối",
    "dua leo": "dưa leo",
    "thi la": "thì là",
    "bao soi": "bào sợi",
    "pho mai": "phô mai",
    "kieu My": "kiểu Mỹ",
    "buoi chum": "bưởi chùm",
    "nuoc ep": "nước ép",
    "huong duong": "hướng dương",
    "banh mi": "bánh mì",
    "mu tat": "mù tạt",
    "xuan dao": "xuân đào",
    "dao": "đào",
    "sua chua": "sữa chua",
    "Hy Lap": "Hy Lạp",
    "dau tay": "dâu tây",
    "dau, dua": "dầu, dừa",
    "dua": "dừa",
    "dau": "đậu",
    "ga tay": "gà tây",
    "ga": "gà",
    "dui": "đùi",
    "uc": "ức",
    "mi y": "mì Ý",
    "cat lat": "cắt lát",
    "o liu": "ô liu",
    "nhoi": "nhồi",
    "ot pimiento": "ớt pimiento",
    "banh quy": "bánh quy",
    "yen mach": "yến mạch",
    "nho kho": "nho khô",
    "ca ngu": "cá ngừ",
    "ca": "cá",
    "com": "cơm",
    "heo": "heo",
    "ca rot": "cà rốt",
    "Thuy Si": "Thụy Sĩ",
    "sung": "sung",
    "xa lach": "xà lách",
    "dua luoi": "dưa lưới",
    "cam": "cam",
    "sua": "sữa",
    "le": "lê",
    "duong": "đường",
    "bong cai xanh": "bông cải xanh",
    "tuong ca": "tương cà",
    "bot": "bột",
    "lua mi": "lúa mì",
    "bap": "bắp",
    "toi": "tỏi",
    "nau": "nâu",
    "phan round": "phần round",
    "than lung": "thăn lưng",
    "than noi": "thăn nội",
    "than ngoai": "thăn ngoài",
    "bit tet": "bít tết",
    "mieng nuong": "miếng nướng",
    " or ": " hoặc ",
    " in ": " trong ",
}


def split_name(name: str) -> tuple[str, str]:
    if name.endswith(" (USDA)"):
        return name[:-7], "USDA"
    return name, ""


def normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" ,")


def add_diacritics(value: str) -> str:
    accented = value
    for src in sorted(DIACRITIC_MAP, key=len, reverse=True):
        if src.strip() != src:
            accented = re.sub(re.escape(src), DIACRITIC_MAP[src], accented, flags=re.IGNORECASE)
        else:
            accented = re.sub(rf"\b{re.escape(src)}\b", DIACRITIC_MAP[src], accented, flags=re.IGNORECASE)
    return accented


def vietnamize_part(part: str) -> str:
    text = part.strip()
    lower = text.lower()
    placeholders = {}

    for index, src in enumerate(sorted(PHRASE_MAP, key=len, reverse=True)):
        marker = f"phraseplaceholder{index}"
        pattern = rf"\b{re.escape(src)}\b"
        if re.search(pattern, lower):
            lower = re.sub(pattern, marker, lower)
            placeholders[marker.lower()] = PHRASE_MAP[src]

    tokens = re.split(r"(\W+)", lower)
    translated = []
    for token in tokens:
        if token in placeholders:
            translated.append(placeholders[token])
            continue
        if re.fullmatch(r"\w[\w-]*", token):
            translated.append(WORD_MAP.get(token, token))
        else:
            translated.append(token)
    return add_diacritics(normalize_spaces("".join(translated)))


def vietnamize_name_rule(name: str) -> str:
    base, suffix = split_name(name)
    parts = [vietnamize_part(part) for part in base.split(",")]
    translated = ", ".join(part for part in parts if part)
    translated = translated[:1].upper() + translated[1:] if translated else base
    return f"{translated} ({suffix} VI)" if suffix else translated


def clean_for_google(name: str) -> str:
    base, _ = split_name(name)
    return normalize_spaces(base)


def normalize_google_translation(value: str) -> str:
    value = normalize_spaces(value)
    value = re.sub(r"\bUSDA\b", "", value, flags=re.IGNORECASE)
    value = normalize_spaces(value)
    return value[:1].upper() + value[1:] if value else value


def js_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def load_cache(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def save_cache(path: Path, cache: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def google_translate_text(text: str, timeout: float) -> str:
    import requests
    from bs4 import BeautifulSoup

    response = requests.get(
        "https://translate.google.com/m",
        params={"sl": "en", "tl": "vi", "q": text},
        headers={"User-Agent": "Mozilla/5.0"},
        timeout=timeout,
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    element = soup.find("div", class_="result-container") or soup.find("div", class_="t0")
    if not element:
        raise RuntimeError(f"Google translation not found for: {text}")
    return element.get_text(strip=True)


def build_google_translator(cache_path: Path, sleep_seconds: float, timeout: float, verbose: bool):
    cache = load_cache(cache_path)
    total_requests = {"count": 0, "fallback": 0}

    def translate_name(name: str) -> str:
        base = clean_for_google(name)
        if base not in cache:
            total_requests["count"] += 1
            try:
                translated = google_translate_text(base, timeout)
                cache[base] = normalize_google_translation(translated)
                if verbose:
                    print(f"[google] {total_requests['count']}: {base} -> {cache[base]}", file=sys.stderr)
            except Exception as exc:
                total_requests["fallback"] += 1
                cache[base] = vietnamize_name_rule(name).removesuffix(" (USDA VI)")
                print(f"[fallback] {base}: {exc}", file=sys.stderr)
            save_cache(cache_path, cache)
            if sleep_seconds > 0:
                time.sleep(sleep_seconds)
        return f"{cache[base]} (USDA VI)"

    def flush() -> None:
        save_cache(cache_path, cache)
        if verbose:
            print(
                f"[cache] {len(cache)} entries, {total_requests['fallback']} fallback translations",
                file=sys.stderr,
            )

    translate_name.flush = flush  # type: ignore[attr-defined]
    return translate_name


def find_generated_block(content: str) -> tuple[int, int] | None:
    start = content.find(ALIAS_HEADER)
    if start == -1:
        return None
    end = content.find(ALIAS_FOOTER, start)
    if end == -1:
        raise ValueError("Found alias block header without footer")
    line_end = content.find("\n", end)
    if line_end == -1:
        line_end = len(content)
    else:
        line_end += 1
    line_start = content.rfind("\n", 0, start) + 1
    return line_start, line_end


def iter_usda_entries(content: str) -> list[tuple[str, str]]:
    block_range = find_generated_block(content)
    if block_range:
        content = content[: block_range[0]] + content[block_range[1] :]

    start = content.index(USDA_HEADER)
    end_candidates = [pos for marker in [VN_HEADER, ALIAS_HEADER] if (pos := content.find(marker, start + 1)) != -1]
    end = min(end_candidates) if end_candidates else content.index("};", start)
    block = content[start:end]

    entries = []
    for line in block.splitlines():
        match = ENTRY_RE.match(line)
        if not match:
            continue
        name = match.group("name")
        if name.endswith(" (USDA)"):
            entries.append((name, match.group("body")))
    return entries


def build_alias_block(entries: list[tuple[str, str]], translate_name) -> str:
    seen = set()
    lines = ["", ALIAS_HEADER]
    for english_name, body in entries:
        vi_name = translate_name(english_name)
        if vi_name in seen:
            vi_name = f"{vi_name} - {english_name[:-7]}"
        seen.add(vi_name)
        lines.append(f'  "{js_string(vi_name)}": {body},')
    lines.append(ALIAS_FOOTER)
    return "\n".join(lines) + "\n"


def apply_alias_mode(content: str, entries: list[tuple[str, str]], translate_name) -> str:
    block_range = find_generated_block(content)
    if block_range:
        content = content[: block_range[0]].rstrip() + "\n" + content[block_range[1] :].lstrip("\n")

    insert_pos = content.index(VN_HEADER)
    before = content[:insert_pos].rstrip()
    after = content[insert_pos:].lstrip("\n")

    if before.endswith("}"):
        before += ","
    return before + build_alias_block(entries, translate_name) + after


def apply_rename_mode(content: str, translate_name) -> str:
    def rename_line(match: re.Match[str]) -> str:
        name = match.group("name")
        if not name.endswith(" (USDA)"):
            return match.group(0)
        return f'{match.group("indent")}"{js_string(translate_name(name))}": {match.group("body")}{match.group("comma")}'

    block_range = find_generated_block(content)
    if block_range:
        content = content[: block_range[0]] + content[block_range[1] :]

    return "\n".join(ENTRY_RE.sub(rename_line, line) for line in content.splitlines()) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description="Vietnamize USDA food names in js/foods.js")
    parser.add_argument("--file", default=str(FOODS_JS), help="Path to foods.js")
    parser.add_argument("--mode", choices=["alias", "rename"], default="alias")
    parser.add_argument("--translator", choices=["rule", "google"], default="rule")
    parser.add_argument("--cache", default=str(DEFAULT_CACHE), help="Google translation cache JSON")
    parser.add_argument("--sleep", type=float, default=0.15, help="Delay between uncached Google requests")
    parser.add_argument("--timeout", type=float, default=10, help="Google request timeout in seconds")
    parser.add_argument("--verbose", action="store_true", help="Print Google translation progress")
    parser.add_argument("--dry-run", action="store_true", help="Print a preview without writing")
    parser.add_argument("--limit", type=int, default=12, help="Preview row count for --dry-run")
    args = parser.parse_args()

    path = Path(args.file)
    content = path.read_text(encoding="utf-8")
    entries = iter_usda_entries(content)
    if args.translator == "google":
        translate_name = build_google_translator(Path(args.cache), args.sleep, args.timeout, args.verbose)
    else:
        translate_name = vietnamize_name_rule

    if args.dry_run:
        print(f"Found {len(entries)} USDA entries")
        for english_name, _ in entries[: args.limit]:
            print(f"- {english_name} -> {translate_name(english_name)}")
        flush = getattr(translate_name, "flush", None)
        if flush:
            flush()
        return

    if args.mode == "alias":
        new_content = apply_alias_mode(content, entries, translate_name)
    else:
        new_content = apply_rename_mode(content, translate_name)

    flush = getattr(translate_name, "flush", None)
    if flush:
        flush()

    path.write_text(new_content, encoding="utf-8")
    print(f"{args.mode}: vietnamized {len(entries)} USDA entries in {path} using {args.translator}")


if __name__ == "__main__":
    main()
