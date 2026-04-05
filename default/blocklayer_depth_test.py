"""
Blocklayer Rafter — bekreftelsesblokk for rafter_depth.

Varierer kun rafter_depth, holder alt annet fast.
Verifiserer at depth-kjeden holder:
  plumb_cut_length = depth / cos(θ)
  plumb_cut_setback = depth * tan(θ)
  hap = plumb_cut_length - birdsmouth_depth
  rise = run * tan(θ) + hap
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

# Faste verdier for denne blokken
FIXED_RUN = 3000
FIXED_ANGLE = 30
FIXED_OVERHANG = 300
FIXED_SEAT = 100


class RafterOutput(BaseModel):
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
    plumb_cut_angle: Optional[float] = None
    seat_cut_angle: Optional[float] = None
    roof_angle: Optional[float] = None


TEST_CASES = [
    {"rafter_depth": 100},   # 2×4 / tynn sperre
    {"rafter_depth": 148},   # 48×148 (norsk standard)
    {"rafter_depth": 200},   # standard (kontrollpunkt fra runde 1)
    {"rafter_depth": 248},   # 48×248
    {"rafter_depth": 300},   # limtrebjelke
    {"rafter_depth": 400},   # stor limtre, grenseverdi
]

TASK_TEMPLATE = """
Go to https://www.blocklayer.com/roof/rafter

Fill in these values in the calculator:
- Set "Run" to {run}
- Set "Roof Angle" to {angle}
- Set "Overhang" to {overhang}
- Set "Rafter Depth" (or "Rafter Width" or rafter cross-section height) to {depth}
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

OUTPUT_FILE = "blocklayer_depth_resultater.json"


def normalize_angles(parsed: RafterOutput, input_roof_angle: float) -> bool:
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


def compute_expected(depth: int) -> dict:
    """Beregn forventede verdier fra Blocklayer-formlene."""
    angle_rad = math.radians(FIXED_ANGLE)
    bird_depth = FIXED_SEAT * math.tan(angle_rad)
    plumb_cut_length = depth / math.cos(angle_rad)
    plumb_cut_setback = depth * math.tan(angle_rad)
    hap = plumb_cut_length - bird_depth
    rafter_top_length = (FIXED_RUN + FIXED_OVERHANG) / math.cos(angle_rad)
    total_rafter_length = rafter_top_length + plumb_cut_setback
    rise = FIXED_RUN * math.tan(angle_rad) + hap
    return {
        "plumb_cut_length": round(plumb_cut_length, 1),
        "plumb_cut_setback": round(plumb_cut_setback, 1),
        "hap": round(hap, 1),
        "rise": round(rise, 1),
        "rafter_top_length": round(rafter_top_length, 1),
        "total_rafter_length": round(total_rafter_length, 1),
    }


def run_single_case(client, case, index, total):
    depth = case["rafter_depth"]
    print(f"\n[{index + 1}/{total}] rafter_depth={depth}")

    task_text = TASK_TEMPLATE.format(
        run=FIXED_RUN, angle=FIXED_ANGLE,
        overhang=FIXED_OVERHANG, depth=depth,
    )

    for attempt in range(1, MAX_RETRIES + 1):
        if attempt > 1:
            print(f"  Retry {attempt}/{MAX_RETRIES}...")
        try:
            task = client.tasks.create_task(
                task=task_text,
                start_url="https://www.blocklayer.com/roof/rafter",
                llm="browser-use-2.0",
                schema=RafterOutput,
            )
            result = task.complete(interval=3)
        except Exception as e:
            print(f"  Forsøk {attempt} feilet: {e}")
            continue

        if result.status != "finished" or result.parsed_output is None:
            print(f"  Forsøk {attempt}: {result.status}")
            continue

        parsed = result.parsed_output
        normalize_angles(parsed, FIXED_ANGLE)
        output = parsed.model_dump()

        # Beregn plumb_cut_length og hap
        angle_rad = math.radians(FIXED_ANGLE)
        actual_depth = output.get("rafter_depth") or depth
        bird_depth = output.get("birdsmouth_depth")

        plumb_cut_length = round(actual_depth / math.cos(angle_rad), 1)
        output["plumb_cut_length"] = plumb_cut_length
        output["hap_raw"] = output.get("hap")
        if bird_depth is not None:
            output["hap"] = round(plumb_cut_length - bird_depth, 1)

        print(f"  OK (forsøk {attempt})")
        return {
            "input": {
                "run": FIXED_RUN, "roof_angle": FIXED_ANGLE,
                "overhang": FIXED_OVERHANG, "rafter_depth": depth,
            },
            "status": "ok",
            "output": output,
            "expected": compute_expected(depth),
            "raw_output": result.output,
        }

    print(f"  FEILET etter {MAX_RETRIES} forsøk")
    return {
        "input": {"rafter_depth": depth},
        "status": "error",
        "error": f"failed after {MAX_RETRIES} attempts",
    }


def main():
    client = BrowserUse(api_key=os.environ["BROWSER_USE_API_KEY"])

    total = len(TEST_CASES)
    print("Blocklayer depth-bekreftelse")
    print(f"Fast: run={FIXED_RUN}, vinkel={FIXED_ANGLE}°, "
          f"overhang={FIXED_OVERHANG}, seat={FIXED_SEAT}")
    print(f"Varierer: rafter_depth ({total} cases)")
    print("=" * 60)

    results = []

    for i, case in enumerate(TEST_CASES):
        entry = run_single_case(client, case, i, total)
        results.append(entry)

    # Lagre
    output_path = os.path.join(os.path.dirname(__file__), OUTPUT_FILE)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "collected_at": datetime.now().isoformat(),
            "source": "https://www.blocklayer.com/roof/rafter",
            "test_block": "rafter_depth",
            "fixed_inputs": {
                "run": FIXED_RUN, "roof_angle": FIXED_ANGLE,
                "overhang": FIXED_OVERHANG, "birdsmouth_seat": FIXED_SEAT,
            },
            "results": results,
        }, f, indent=2, ensure_ascii=False)

    # Analyse
    print("\n" + "=" * 60)
    print("ANALYSE — depth-kjeden")
    print("=" * 60)

    check_fields = [
        "plumb_cut_setback", "plumb_cut_length", "hap", "rise",
        "rafter_top_length", "total_rafter_length",
    ]
    print(f"\n{'depth':>6}  {'felt':<22} {'forventet':>10} {'innsamlet':>10} {'avvik':>7}")
    print("-" * 60)

    all_ok = True
    for r in results:
        if r["status"] != "ok":
            depth = r["input"].get("rafter_depth", "?")
            print(f"{depth:>6}  FEILET")
            all_ok = False
            continue

        depth = r["input"]["rafter_depth"]
        expected = r["expected"]
        output = r["output"]

        for field in check_fields:
            exp = expected.get(field)
            got = output.get(field)
            if exp is None or got is None:
                diff_str = "null"
                all_ok = False
            else:
                diff = got - exp
                diff_str = f"{diff:+.1f}"
                if abs(diff) > 2:
                    diff_str += " !"
                    all_ok = False

            print(f"{depth:>6}  {field:<22} {exp or 'n/a':>10} {got or 'n/a':>10} {diff_str:>7}")

    # Felter som IKKE bør endres med depth
    print(f"\n{'depth':>6}  {'felt (bør være fast)':<22} {'innsamlet':>10} {'forventet':>10}")
    print("-" * 60)
    for r in results:
        if r["status"] != "ok":
            continue
        depth = r["input"]["rafter_depth"]
        output = r["output"]
        total_run = output.get("total_rafter_run")
        bird_seat = output.get("birdsmouth_seat")
        print(f"{depth:>6}  {'total_rafter_run':<22} {total_run or 'n/a':>10} {3300:>10}")
        print(f"{depth:>6}  {'birdsmouth_seat':<22} {bird_seat or 'n/a':>10} {100:>10}")

    print(f"\n{'Alt OK' if all_ok else 'Avvik funnet — se detaljer over'}")
    print(f"Lagret: {output_path}\n")


if __name__ == "__main__":
    main()
