#!/usr/bin/env python3
"""Convert a legacy .xls nutrition workbook into JSON.

By default, this script reads `thanh phan dinh duong.xls` from the same folder
and writes `thanh phan dinh duong.json` next to it.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import xlrd


COLUMN_KEYS = [
    "calories",
    "protein",
    "fat",
    "carbohydrates",
    "fibre",
    "cholesterol",
    "calcium",
    "phosphorus",
    "iron",
    "sodium",
    "potassium",
    "beta_carotene",
    "vitamin_a",
    "vitamin_b1",
    "vitamin_c",
]


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def parse_number(value: Any) -> Any:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        if isinstance(value, float) and value.is_integer():
            return int(value)
        return value

    text = normalize_text(value)
    if not text:
        return None

    compact = text.replace(" ", "")
    if "," in compact and "." in compact:
        compact = compact.replace(".", "").replace(",", ".")
    else:
        compact = compact.replace(",", ".")

    if re.fullmatch(r"[-+]?\d+", compact):
        return int(compact)

    if re.fullmatch(r"[-+]?\d*\.\d+", compact):
        number = float(compact)
        if number.is_integer():
            return int(number)
        return number

    return text


def is_empty_row(values: list[Any]) -> bool:
    return not any(normalize_text(value) for value in values)


def is_category_row(values: list[Any]) -> bool:
    first = normalize_text(values[0]) if values else ""
    if not first:
        return False
    rest = [normalize_text(value) for value in values[1:]]
    return all(not value for value in rest)


def is_data_row(values: list[Any]) -> bool:
    if len(values) < 2:
        return False
    first = values[0]
    second = normalize_text(values[1])
    return isinstance(first, (int, float)) and bool(second)


def find_row_index(sheet: xlrd.sheet.Sheet, matcher) -> int:
    for row_index in range(sheet.nrows):
        values = sheet.row_values(row_index)
        if matcher(values):
            return row_index
    raise ValueError("Could not locate the expected header row in the workbook.")


def convert_workbook(input_path: Path) -> dict[str, Any]:
    workbook = xlrd.open_workbook(str(input_path))
    sheet = workbook.sheet_by_index(0)

    header_row_index = find_row_index(sheet, lambda values: normalize_text(values[0]).upper() == "STT")
    unit_row_index = None
    for row_index in range(header_row_index + 1, sheet.nrows):
        values = sheet.row_values(row_index)
        if normalize_text(values[2]).lower() == "kcal":
            unit_row_index = row_index
            break
    if unit_row_index is None:
        raise ValueError("Could not locate the units row in the workbook.")

    document_title = normalize_text(sheet.row_values(0)[0])
    source_note = normalize_text(sheet.row_values(sheet.nrows - 1)[9])

    foods: list[dict[str, Any]] = []
    current_category = None

    for row_index in range(unit_row_index + 1, sheet.nrows):
        values = sheet.row_values(row_index)[:17]

        if is_empty_row(values):
            continue

        if is_category_row(values):
            current_category = normalize_text(values[0])
            continue

        if not is_data_row(values):
            continue

        item = {
            "row": row_index + 1,
            "index": parse_number(values[0]),
            "name": normalize_text(values[1]),
            "category": current_category,
        }

        for offset, key in enumerate(COLUMN_KEYS, start=2):
            item[key] = parse_number(values[offset]) if offset < len(values) else None

        foods.append(item)

    return {
        "source_file": input_path.name,
        "sheet_name": sheet.name,
        "title": document_title,
        "source_note": source_note,
        "headers": COLUMN_KEYS,
        "foods": foods,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert an .xls nutrition workbook to JSON.")
    parser.add_argument(
        "input",
        nargs="?",
        default=str(Path(__file__).with_name("thanh phan dinh duong.xls")),
        help="Path to the .xls file",
    )
    parser.add_argument(
        "output",
        nargs="?",
        default=None,
        help="Optional output path. Defaults to the same name with .json in the same folder.",
    )
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    output_path = Path(args.output).expanduser().resolve() if args.output else input_path.with_suffix(".json")

    payload = convert_workbook(input_path)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {len(payload['foods'])} rows to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())