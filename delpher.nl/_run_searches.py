#!/usr/bin/env python3
"""Query Delpher's SRU API for van Duijnhoven family records and dump structured results."""
import json
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

SRU = "https://jsru.kb.nl/sru/sru"
NS = {
    "srw": "http://www.loc.gov/zing/srw/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcx": "http://krait.kb.nl/coop/tel/handbook/telterms.html",
}

# (label, CQL query). x-collection=DDD_artikel = newspaper articles.
SEARCHES = [
    ("van_Duijnhoven_Uden", '"van Duijnhoven" AND Uden'),
    ("van_Duynhoven_Uden", '"van Duynhoven" AND Uden'),
    ("Marianus_van_Duijnhoven", '"Marianus van Duijnhoven"'),
    ("Marianus_Duijnhoven_loose", 'Marianus AND Duijnhoven'),
    ("Anna_Maria_van_den_Elzen", '"Anna Maria van den Elzen"'),
    ("vd_Elzen_Uden", '"van den Elzen" AND Uden'),
    ("Johan_van_Duijnhoven", '"Johan van Duijnhoven"'),
    ("Duijnhoven_emigratie", 'Duijnhoven AND emigratie'),
    ("Duijnhoven_Amerika_Uden", 'Duijnhoven AND Amerika AND Uden'),
]


def fetch(query, maximum=50):
    params = {
        "version": "1.2",
        "operation": "searchRetrieve",
        "x-collection": "DDD_artikel",
        "query": query,
        "maximumRecords": str(maximum),
    }
    url = SRU + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "genealogy-research/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def parse(xml_text):
    root = ET.fromstring(xml_text)
    total = root.findtext("srw:numberOfRecords", default="0", namespaces=NS)
    recs = []
    for rec in root.findall(".//srw:record", NS):
        data = rec.find("srw:recordData", NS)
        if data is None:
            continue
        def g(tag):
            el = data.find(tag, NS)
            return el.text.strip() if el is not None and el.text else ""
        ident = g("dc:identifier")
        # Build a human page URL from the resolver URN
        page_url = ""
        if "urn=" in ident:
            urn = ident.split("urn=", 1)[1].replace(":ocr", "")
            page_url = "https://www.delpher.nl/nl/kranten/view?identifier=" + urn
        recs.append({
            "date": g("dc:date"),
            "title": g("dc:title"),
            "type": g("dc:type"),
            "source": g("dc:source"),
            "publisher": g("dc:publisher"),
            "identifier": ident,
            "page_url": page_url,
        })
    return int(total), recs


def main():
    out = {}
    for label, query in SEARCHES:
        try:
            xml_text = fetch(query)
            total, recs = parse(xml_text)
            out[label] = {"query": query, "total": total, "records": recs}
            print(f"[{label}] query={query!r} total={total} returned={len(recs)}", file=sys.stderr)
        except Exception as e:  # noqa
            out[label] = {"query": query, "error": str(e)}
            print(f"[{label}] ERROR {e}", file=sys.stderr)
    with open("search_results.json", "w") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print("WROTE search_results.json", file=sys.stderr)


if __name__ == "__main__":
    main()
