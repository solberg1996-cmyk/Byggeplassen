"""
Blocklayer Rafter — datainnsamler v4

Kjører en fast testbatch mot Blocklayer sin sperrekalkulator
med structured output, vinkel-normalisering, beregnede felt,
HAP-validering, retry og debug-logging.
"""

import json
import math
import os
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel
from browser_use_sdk import BrowserUse

load_dotenv()

MAX_RETRIES = 2


# ── Structured output schema ────────────────────────────────────

class RafterOutput(BaseModel):
    """Alle verdier fra Blocklayer rafter-kalkulatoren."""
    # Lengder (mm)
    rise: Optional[float] = None
    total_rafter_length: Optional[float] = None
    rafter_top_length: Optional[float] = None
    total_rafter_run: Optional[float] = None
    total_fall: Optional[float] = None
    overhang_level: Optional[float] = None
    rafter_depth: Optional[float] = None
    birdsmouth_depth: Optional[float] = None
    birdsmouth_seat: Optional[float] = None
    plumb_cut_setback: Optional[float] = None
    hap: Optional[float] = None

    # Vinkler (grader, bare tallet — ingen °-tegn)
    plumb_cut_angle: Optional[float] = None
    seat_cut_angle: Optional[float] = None
    roof_angle: Optional[float] = None


# ── Testcases ───────────────────────────────────────────────────

TEST_CASES = [
    # Lave vinkler (15–20°) — flate tak, carport
    {"run": 2000, "roof_angle": 15, "overhang": 200},
    {"run": 3000, "roof_angle": 15, "overhang": 300},
    {"run": 4000, "roof_angle": 18, "overhang": 400},

    # Vanlige boligvinkler (22–30°) — mest brukt i Norge
    {"run": 2500, "roof_angle": 22, "overhang": 300},
    {"run": 3000, "roof_angle": 25, "overhang": 300},
    {"run": 3000, "roof_angle": 30, "overhang": 300},
    {"run": 3500, "roof_angle": 27, "overhang": 400},
    {"run": 4000, "roof_angle": 22, "overhang": 500},
    {"run": 4500, "roof_angle": 30, "overhang": 400},

    # Bratte tak (35–45°) — eldre hus, loft med utnyttbar etasje
    {"run": 2500, "roof_angle": 35, "overhang": 300},
    {"run": 3000, "roof_angle": 40, "overhang": 300},
    {"run": 3500, "roof_angle": 45, "overhang": 400},
    {"run": 4000, "roof_angle": 38, "overhang": 500},

    # Ekstreme verdier — grensetilfeller
    {"run": 1500, "roof_angle": 10, "overhang": 150},
    {"run": 6000, "roof_angle": 50, "overhang": 600},
    {"run": 5000, "roof_angle": 30, "overhang": 0},
]

TASK_TEMPLATE = """
Go to https://www.blocklayer.com/roof/rafter

Fill in these values in the calculator:
- Set "Run" to {run}
- Set "Roof Angle" to {roof_angle}
- Set "Overhang" to {overhang}
- Leave all other fields at their default values

If there is a "Calculate" button, click it.

Read ALL numeric results from the page and return them as structured data.

IMPORTANT rules for the output:
- All length values are in mm (just the number, no units)
- All angle values are in degrees (just the number, no ° symbol)
- "plumb_cut_setback" is the "Measure back to form Plumb-Cuts" distance in mm, NOT an angle
- "plumb_cut_angle" is the plumb cut angle in degrees
- "total_rafter_length" is the full length including overhang
- "rafter_top_length" is the length excluding the plumb cut setback
- "hap" is Height Above Plate if shown
- Use null for any field not visible on the page
"""

OUTPUT_FILE = "blocklayer_resultater.json"


# ── Normalisering av vinkler ────────────────────────────────────
# Blocklayer veksler mellom to konvensjoner:
#   A: plumb_cut_angle = roof_angle  (målt fra vannrett)
#   B: plumb_cut_angle = 90 - roof_angle  (målt fra loddrett)
# Vår konvensjon: plumb_cut_angle = roof_angle, alltid.

def normalize_angles(parsed: RafterOutput, input_roof_angle: float) -> bool:
    """Swap plumb/seat angles hvis Blocklayer brukte komplementkonvensjonen.
    Returnerer True hvis en flip ble gjort."""
    if parsed.plumb_cut_angle is None or parsed.seat_cut_angle is None:
        return False

    diff_direct = abs(parsed.plumb_cut_angle - input_roof_angle)
    diff_complement = abs(parsed.plumb_cut_angle - (90 - input_roof_angle))

    if diff_complement < diff_direct:
        parsed.plumb_cut_angle, parsed.seat_cut_angle = (
            parsed.seat_cut_angle, parsed.plumb_cut_angle
        )
        return True

    return False


# ── Beregnede felt ──────────────────────────────────────────────
# plumb_cut_length og hap kan beregnes eksakt fra Blocklayer sine formler:
#   plumb_cut_length = rafter_depth / cos(θ)
#   hap = plumb_cut_length - birdsmouth_depth
# Disse legges til i output etter innsamling.

def enrich_output(output: dict, case: dict) -> list[str]:
    """Legg til beregnede felt. Returnerer liste med computed field-navn."""
    angle_rad = math.radians(case["roof_angle"])
    depth = output.get("rafter_depth") or 200
    bird_depth = output.get("birdsmouth_depth")

    computed = []

    # plumb_cut_length — alltid beregnet
    plumb_cut_length = round(depth / math.cos(angle_rad), 1)
    output["plumb_cut_length"] = plumb_cut_length
    computed.append("plumb_cut_length")

    # hap — flytt innsamlet verdi til hap_raw, beregn ny
    output["hap_raw"] = output.get("hap")

    if bird_depth is not None:
        output["hap"] = round(plumb_cut_length - bird_depth, 1)
    else:
        output["hap"] = None
    computed.append("hap")

    return computed


# ── Validering ──────────────────────────────────────────────────

LENGTH_FIELDS = [
    "rise", "total_rafter_length", "rafter_top_length", "total_rafter_run",
    "total_fall", "overhang_level", "rafter_depth", "birdsmouth_depth",
    "birdsmouth_seat", "plumb_cut_setback",
]
ANGLE_FIELDS = ["plumb_cut_angle", "seat_cut_angle", "roof_angle"]


def validate_result(data: dict, case: dict) -> list[str]:
    """Returner liste med advarsler. Tom liste = alt ok."""
    warnings = []

    for field in LENGTH_FIELDS:
        val = data.get(field)
        if val is not None and (val < 0 or val > 20000):
            warnings.append(f"{field}={val} utenfor rimelig lengde (0–20000 mm)")

    for field in ANGLE_FIELDS:
        val = data.get(field)
        if val is not None and (val < 0 or val > 90):
            warnings.append(f"{field}={val} utenfor rimelig vinkel (0–90°)")

    roof_angle = data.get("roof_angle")
    if roof_angle is not None and roof_angle != case["roof_angle"]:
        warnings.append(
            f"roof_angle={roof_angle} avviker fra input {case['roof_angle']}"
        )

    total_rafter_run = data.get("total_rafter_run")
    if total_rafter_run is not None:
        expected_run = case["run"] + case["overhang"]
        if abs(total_rafter_run - expected_run) > 1:
            warnings.append(
                f"total_rafter_run={total_rafter_run} "
                f"forventet {expected_run} (run + overhang)"
            )

    total_rafter_length = data.get("total_rafter_length")
    rafter_top_length = data.get("rafter_top_length")
    plumb_cut_setback = data.get("plumb_cut_setback")
    if (total_rafter_length is not None
            and rafter_top_length is not None
            and plumb_cut_setback is not None):
        expected_top = total_rafter_length - plumb_cut_setback
        if abs(rafter_top_length - expected_top) > 2:
            warnings.append(
                f"rafter_top_length={rafter_top_length} "
                f"forventet {expected_top} (total - setback)"
            )

    core_fields = ["rise", "total_rafter_length", "rafter_top_length", "plumb_cut_angle"]
    for field in core_fields:
        if data.get(field) is None:
            warnings.append(f"{field} mangler (forventet verdi)")

    # HAP-validering: sammenlign innsamlet hap_raw mot beregnet hap
    hap_raw = data.get("hap_raw")
    hap_computed = data.get("hap")
    if hap_raw is not None and hap_computed is not None:
        if abs(hap_raw - hap_computed) > 2:
            warnings.append(
                f"hap_raw={hap_raw} avviker fra beregnet hap={hap_computed} "
                f"(sannsynlig feillesning)"
            )

    return warnings


# ── Kjøring ─────────────────────────────────────────────────────

def attempt_case(client, case):
    """Én enkelt forsøk mot Browser Use. Returnerer (result, error_str)."""
    task_text = TASK_TEMPLATE.format(**case)

    task = client.tasks.create_task(
        task=task_text,
        start_url="https://www.blocklayer.com/roof/rafter",
        llm="browser-use-2.0",
        schema=RafterOutput,
    )
    result = task.complete(interval=3)
    return result


def run_single_case(client, case, index, total):
    """Kjør én testcase med retry. Returnerer resultat-dict."""
    label = (
        f"[{index + 1}/{total}] "
        f"run={case['run']} vinkel={case['roof_angle']}° utstikk={case['overhang']}"
    )
    print(f"\n{label}")

    attempts = []

    for attempt in range(1, MAX_RETRIES + 1):
        if attempt > 1:
            print(f"  Retry {attempt}/{MAX_RETRIES}...")

        try:
            result = attempt_case(client, case)
        except Exception as e:
            error_msg = str(e)
            attempts.append({"attempt": attempt, "error": error_msg})
            print(f"  Forsøk {attempt} feilet: {error_msg}")
            continue

        if result.status != "finished":
            attempts.append({
                "attempt": attempt,
                "status": result.status,
                "raw_output": result.output,
            })
            print(f"  Forsøk {attempt}: task {result.status}")
            continue

        parsed = result.parsed_output
        if parsed is None:
            attempts.append({
                "attempt": attempt,
                "status": "parse_error",
                "raw_output": result.output,
            })
            print(f"  Forsøk {attempt}: parsing feilet")
            print(f"    raw_output: {result.output[:200]}")
            continue

        # Suksess — normaliser, beregn, valider
        flipped = normalize_angles(parsed, case["roof_angle"])
        if flipped:
            print(f"  FLIP: plumb/seat vinkler swappet til vår konvensjon")

        output_data = parsed.model_dump()
        computed_fields = enrich_output(output_data, case)

        warnings = validate_result(output_data, case)
        status = "ok" if not warnings else "warning"

        if warnings:
            print(f"  ADVARSLER:")
            for w in warnings:
                print(f"    - {w}")
            print(f"  DEBUG output: {json.dumps(output_data, indent=None)}")
        else:
            print(f"  OK (forsøk {attempt})")

        return {
            "input": case,
            "status": status,
            "output": output_data,
            "computed_fields": computed_fields,
            "raw_output": result.output,
            "angle_flipped": flipped,
            "warnings": warnings,
            "attempts": attempts + [{"attempt": attempt, "status": "ok"}],
        }

    # Alle forsøk feilet
    print(f"  FEILET etter {MAX_RETRIES} forsøk")
    return {
        "input": case,
        "status": "error",
        "error": f"failed after {MAX_RETRIES} attempts",
        "attempts": attempts,
    }


def main():
    client = BrowserUse(api_key=os.environ["BROWSER_USE_API_KEY"])

    total = len(TEST_CASES)
    print("Blocklayer datainnsamler v4 (beregnede felt + HAP-validering)")
    print(f"Kjører {total} testcases, maks {MAX_RETRIES} forsøk per case")
    print("=" * 50)

    results = []
    counts = {"ok": 0, "warning": 0, "error": 0}
    flip_count = 0

    for i, case in enumerate(TEST_CASES):
        entry = run_single_case(client, case, i, total)
        results.append(entry)

        s = entry["status"]
        if s == "ok":
            counts["ok"] += 1
        elif s == "warning":
            counts["warning"] += 1
        else:
            counts["error"] += 1

        if entry.get("angle_flipped"):
            flip_count += 1

    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_FILE)
    data = {
        "collected_at": datetime.now().isoformat(),
        "source": "https://www.blocklayer.com/roof/rafter",
        "schema_version": 4,
        "total_cases": total,
        "ok": counts["ok"],
        "warnings": counts["warning"],
        "errors": counts["error"],
        "angle_flips": flip_count,
        "results": results,
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 50)
    print("OPPSUMMERING")
    print("=" * 50)
    print(f"Kjørt:      {total}")
    print(f"OK:         {counts['ok']}")
    print(f"Advarsler:  {counts['warning']}")
    print(f"Feil:       {counts['error']}")
    print(f"Vinkelflip: {flip_count}")
    print(f"Lagret:     {output_path}")

    if counts["warning"] > 0:
        print("\nCases med advarsler:")
        for r in results:
            if r["status"] == "warning":
                c = r["input"]
                print(f"  run={c['run']} vinkel={c['roof_angle']}°:")
                for w in r["warnings"]:
                    print(f"    - {w}")

    if counts["error"] > 0:
        print("\nFeilede cases:")
        for r in results:
            if r["status"] not in ("ok", "warning"):
                c = r["input"]
                print(f"  run={c['run']} vinkel={c['roof_angle']}°:")
                for a in r.get("attempts", []):
                    err = a.get("error") or a.get("status", "?")
                    raw = a.get("raw_output", "")
                    print(f"    forsøk {a['attempt']}: {err}")
                    if raw:
                        print(f"      raw: {str(raw)[:150]}")

    print()


if __name__ == "__main__":
    main()
