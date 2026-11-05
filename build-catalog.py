"""Build the complete portfolio index from the supplied source inventories.

Run from any directory with Python 3. No network requests or dependencies.
The original filename/title remains available alongside each editorial title.
"""

from collections import Counter
import json
from pathlib import Path
import re

SITE = Path(__file__).resolve().parent
WORKSPACE = SITE.parent.parent
RESEARCH = WORKSPACE / "tmp"
DIST = SITE / "public"

SOURCE_LABELS = {
    "recent": "Recent work",
    "archive": "Studio archive",
    "behance": "Behance selection",
}

# Labels retain source versions, aspect-ratio identifiers, and export distinctions.
# These are editorial display labels; originalTitle is always the source text.
TITLE_OVERRIDES = {
    "stories devika shoot v2": "Stories — Devika · V2",
    "apple tree wayanad home video": "Apple Tree — Wayanad home",
    "apple tree wayanad home video 2": "Apple Tree — Wayanad home · 02",
    "stories devika presentation video 2": "Stories — Devika presentation · 02",
    "stories nri ad video 02": "Stories — NRI campaign · 02",
    "zodiya script reel video out": "Zodiya — Script reel",
    "zodiya storage stool video v3": "Zodiya — Storage stool · V3",
    "stories grn sofa video 9-16": "Stories — Green sofa · 9:16",
    "stories dining table video": "Stories — Dining table",
    "intl hinid ad for rstio": "International Hindi ad · ratio edit",
    "zodiya - amal ad video 9-16": "Zodiya — Amal campaign · 9:16",
    "stories fur-video to ad 9-16": "Stories — Furniture campaign · 9:16",
    "stories clearence sale video": "Stories — Clearance sale",
    "stories kochi fur-video": "Stories — Kochi furniture",
    "zodiya helicoptor video 02": "Zodiya — Helicopter · 02",
    "zodiya legacy video final out 01": "Zodiya — Legacy · Final 01",
    "bronet onam name reveal": "Bronet — Onam name reveal",
    "manakkal video out": "Manakkal",
    "jasim pre-wedding video 02": "Jasim — Pre-wedding · 02",
    "jasim pre wedding video out": "Jasim — Pre-wedding",
    "stories intl sruthi hindi ad video": "Stories — Sruthi · Hindi campaign",
    "bebright allwyn podcast video 01": "BeBright — Allwyn podcast · 01",
    "stories intl furn-tourism podcast video final 04": "Stories — Furniture tourism podcast · Final 04",
    "stories intl prashanth hindi ad video": "Stories — Prashanth · Hindi campaign",
    "stories intl furn-tourism podcast video 03": "Stories — Furniture tourism podcast · 03",
    "amal stories monsoon video final 9-16": "Stories — Amal monsoon · Final 9:16",
    "stories intl fur-podcast video 02": "Stories — Furniture podcast · 02",
    "stories intl fur-podcast video 01": "Stories — Furniture podcast · 01",
    "apple tree home-w video": "Apple Tree — Home W",
    "apple factory video out": "Apple Tree — Factory",
    "amal msquad video": "M Squad — Amal",
    "firoz sir video june 29 out": "Firoz — June 29",
    "manakkal-furniture video 03": "Manakkal — Furniture · 03",
    "manakkal-furniture video 01": "Manakkal — Furniture · 01",
    "manakkal-furniture video 02": "Manakkal — Furniture · 02",
    "stories hindi ad video 01": "Stories — Hindi campaign · 01",
    "for linkedin post": "LinkedIn edit",
    "stories furniture video out 01": "Stories — Furniture · 01",
    "stories int ad video final": "Stories — International campaign · Final",
    "stories int ad video": "Stories — International campaign",
    "stories furniture version2": "Stories — Furniture · V2",
    "bronet enviornment day video out": "Bronet — Environment Day",
    "stories sofa video - reviera": "Stories — Reviera sofa",
    "apple tree factory v1": "Apple Tree — Factory · V1",
    "apple tree factory v1 (1)": "Apple Tree — Factory · V1 (1)",
    "stories factory video": "Stories — Factory",
    "apple tree factory video": "Apple Tree — Factory video",
    "apple tree_0": "Apple Tree — Walkthrough · 0",
    "apple tree 0": "Apple Tree — Walkthrough · 0",
    "stories walkthrough": "Stories — Walkthrough",
    "laundry bag black": "Laundry bag — Black",
    "laundry bag tire base": "Laundry bag — Tire base",
    "laundry bag wooden": "Laundry bag — Wooden",
    "stapril01": "Stories — April · 01",
    "monza_out1": "Monza — 01",
    "storiessp05": "Stories — Product study · 05",
    "storiessp04": "Stories — Product study · 04",
    "storiessp03": "Stories — Product study · 03",
    "storiessp02": "Stories — Product study · 02",
    "storiessp01": "Stories — Product study · 01",
    "stories kochi": "Stories — Kochi",
    "scandinavia_stories0": "Stories — Scandinavia · 0",
    "v2_honey sets": "Honey sets · V2",
    "v1_kitchen sets": "Kitchen sets · V1",
    "product shoot portfolio": "Product shoot portfolio",
    "desqoo 1": "Desqoo · 01",
    "reem": "Reem",
    "pasta": "Pasta",
    "shamheel_kotta": "Shamheel Kotta",
    "9_16-5": "Presentation · 9:16 / 05",
    "9_16-4": "Presentation · 9:16 / 04",
    "9_16-3": "Presentation · 9:16 / 03",
    "9_16-2": "Presentation · 9:16 / 02",
    "9_16": "Presentation · 9:16",
    "9 16 4": "Presentation · 9:16 / 04",
    "9 16": "Presentation · 9:16",
    "imat english presentation video": "IMAT — English presentation",
    "ad8fa00b-ef76-4bfe-a675-afcab0c9a429": "Presentation · AD8FA00B",
    "ad8fa00b ef76 4bfe a675 afcab0c9a429": "Presentation · AD8FA00B",
    "blue stars": "Blue Stars",
    "m4 nikah (final)": "M4 Nikah · Final",
    "domuscape (final)": "Domuscape · Final",
    "infinite education": "Infinite Education",
    "zentra learn": "Zentra Learn",
    "tamil presentation video": "Tamil presentation",
    "talent travel & tourism final out": "Talent Travel & Tourism · Final",
    "kannur capital (final)": "Kannur Capital · Final",
    "cma usa, manyata (final)": "Manyata — CMA USA · Final",
    "event video ( new anchor)": "Event presentation — New anchor",
    "talent travel&tourism": "Talent Travel & Tourism",
    "alkor ad 2- e commerce": "Alkor — E-commerce ad · 02",
    "alkor ad 2 e commerce": "Alkor — E-commerce ad · 02",
    "alkor, page boost tips content": "Alkor — Page boost tips",
    "ramshinaad3tvm": "Ramshina — Trivandrum ad · 03",
    "corporate_reel": "Corporate reel",
    "horizontalsummersaletrivandrum": "Stories — Trivandrum summer sale · Horizontal",
    "stories intl hindi ad video 9 16": "Stories — International Hindi campaign · 9:16",
    "project 01": "Project 01",
    "project 02": "Project 02",
}


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def title_stem(value):
    return re.sub(r"\.(?:mp4|mov|webm|m4v|avi)$", "", value, flags=re.I).strip()


def key_for(value):
    return re.sub(r"\s+", " ", title_stem(value)).lower()


def category_for(item):
    title = key_for(item["title"])
    folder = item.get("folderPath", "").upper()
    if "podcast" in title or "pre-wedding" in title or "pre wedding" in title:
        return "People & stories"
    if "walkthrough" in title or "home" in title or folder == "WALKTHROUGH" or title == "apple tree 0":
        return "Spaces"
    if "name reveal" in title or title == "for linkedin post":
        return "Experiments"
    if "factory" in title:
        return "Brand films"
    if folder == "PRESENTATION" or "presentation" in title:
        return "Presentations"
    if folder == "PRODUCT":
        return "Products"
    if any(word in title for word in ("sofa", "stool", "dining table", "furniture", "furn-video")):
        return "Products"
    if title in {"reem", "pasta", "stapril01"} or re.fullmatch(r"c\d+", title):
        return "Products"
    if title in {"project 01", "project 02", "blue stars", "9 16", "9 16 4", "ramshinaad3tvm"} or title.startswith("ad8fa00b") or "alkor" in title:
        return "Presentations"
    return "Brand films"


def friendly_title(original, category):
    key = key_for(original)
    if key in TITLE_OVERRIDES:
        return TITLE_OVERRIDES[key]
    stem = title_stem(original)
    if re.fullmatch(r"C\d+", stem, flags=re.I):
        return f"Product study · {stem.upper()}"
    # Keep unclear identifiers intact instead of inventing a project subject.
    return stem


def create_entry(item, source):
    platform = "youtube" if source == "behance" else "drive"
    file_id = item["id"]
    standard = f"assets/{platform}-{file_id}.jpg"
    large = f"assets/{platform}-{file_id}-large.jpg"
    image = large if (DIST / large).is_file() else standard
    if not (DIST / image).is_file():
        raise FileNotFoundError(f"Missing portfolio artwork: {image}")
    category = category_for(item)
    return {
        "id": file_id,
        "title": friendly_title(item["title"], category),
        "originalTitle": item["title"],
        "source": source,
        "sourceLabel": SOURCE_LABELS[source],
        "platform": platform,
        "category": category,
        "image": image,
        "url": item["sourceUrl"] if platform == "youtube" else item["url"],
    }


def main():
    inputs = {
        "recent": load_json(RESEARCH / "shivad-drive-recent-enriched.json"),
        "archive": load_json(RESEARCH / "shivad-drive-archive.json"),
        "behance": load_json(RESEARCH / "shivad-behance.json")["videos"],
    }
    expected = {"recent": 46, "archive": 54, "behance": 21}
    assert {source: len(items) for source, items in inputs.items()} == expected
    films = [create_entry(item, source) for source, items in inputs.items() for item in items]
    assert len(films) == len({film["id"] for film in films}) == 121
    assert all(film["title"] and film["url"].startswith("https://") for film in films)
    serialized = json.dumps(films, ensure_ascii=False, indent=2).replace("</", "<\\/")
    (DIST / "catalog.js").write_text(
        "// Generated by build-catalog.py; original titles and source links are preserved.\n"
        "window.FILMS = " + serialized + ";\n", encoding="utf-8"
    )
    print(f"Wrote {len(films)} unique entries; every image path exists.")
    print("Sources:", dict(Counter(film["source"] for film in films)))
    print("Categories:", dict(Counter(film["category"] for film in films)))


if __name__ == "__main__":
    main()
