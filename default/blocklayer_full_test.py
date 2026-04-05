"""
Blocklayer Rafter — full verifisering av vår kalkulator.

Kjører 6 ulike cases mot Blocklayer og sammenligner alle felt.
Varierer run, vinkel, utstikk, sperrehøyde og fuglehakk-bredde.
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
    overhang_along_rafter: Optional[float] = None
    hap: Optional[float] = None
    plumb_cut_angle: Optional[float] = None
    seat_cut_angle: Optional[float] = None
    roof_angle: Optional[float] = None


TEST_CASES = [
    # Case 1: Blocklayer-screenshot (brukerverifisert)
    {"run": 3000, "angle": 30, "overhang": 350, "depth": 198, "seat": 98},
    # Case 2: Standardverdier
    {"run": 3000, "angle": 30, "overhang": 300, "depth": 198, "seat": 100},
    # Case 3: Bratt tak (45°)
    {"run": 2500, "angle": 45, "overhang": 400, "depth": 198, "seat": 100},
    # Case 4: Slakt tak (15°)
    {"run": 4000, "angle": 15, "overhang": 300, "depth": 148, "seat": 100},
    # Case 5: Liten sperre (98mm)
    {"run": 2000, "angle": 22, "overhang": 250, "depth": 98, "seat": 70},
    # Case 6: Bred sperre (248mm), langt utstikk
    {"run": 3500, "angle": 35, "overhang": 500, "depth": 248, "seat": 120},
]

TASK_TEMPLATE = """
Go to https://www.blocklayer.com/roof/rafter

Fill in these values in the calculator:
- Set "Run" to {run}
- Set "Roof Angle" to {angle}
- Set "Overhang" to {overhang}
- Set "Rafter Depth" to {depth}
- Set "Birdsmouth Seat" (or "Seat" or "Birds Mouth" seat cut length) to {seat}
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
- "total_rafter_run" is the total horizontal run including overhang
- "total_fall" is the total vertical fall
- "overhang_along_rafter" is the overhang measured along the rafter slope (not horizontal), in mm
- "hap" is Height Above Plate if shown
- Use null for any field not visible on the page
"""

OUTPUT_FILE = "blocklayer_full_resultater.json"


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


def compute_expected(case: dict) -> dict:
    run = case["run"]
    angle = case["angle"]
    overhang = case["overhang"]
    depth = case["depth"]
    seat = case["seat"]

    rad = math.radians(angle)
    total_run = run + overhang
    rafter_top_length = total_run / math.cos(rad)
    plumb_cut_setback = depth * math.tan(rad)
    total_rafter_length = rafter_top_length + plumb_cut_setback
    plumb_cut_length = depth / math.cos(rad)
    bird_depth = seat * math.tan(rad)
    hap = plumb_cut_length - bird_depth
    rise = run * math.tan(rad) + hap
    total_fall = total_run * math.tan(rad)
    overhang_along_rafter = overhang / math.cos(rad)

    return {
        "rafter_top_length": round(rafter_top_length),
        "total_rafter_length": round(total_rafter_length),
        "plumb_cut_setback": round(plumb_cut_setback),
        "plumb_cut_length": round(plumb_cut_length),
        "birdsmouth_depth": round(bird_depth),
        "hap": round(hap),
        "rise": round(rise),
        "total_rafter_run": round(total_run),
        "total_fall": round(total_fall),
        "overhang_along_rafter": round(overhang_along_rafter),
    }


def run_single_case(client, case, index, total):
    label = (f"run={case['run']}, angle={case['angle']}°, "
             f"overhang={case['overhang']}, depth={case['depth']}, "
             f"seat={case['seat']}")
    print(f"\n[{index + 1}/{total}] {label}")

    task_text = TASK_TEMPLATE.format(**case)

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
        normalize_angles(parsed, case["angle"])
        output = parsed.model_dump()

        # Beregn plumb_cut_length og hap (upålitelig fra agent)
        rad = math.radians(case["angle"])
        actual_depth = output.get("rafter_depth") or case["depth"]
        bird_depth = output.get("birdsmouth_depth")

        output["plumb_cut_length"] = round(actual_depth / math.cos(rad), 1)
        output["hap_raw"] = output.get("hap")
        if bird_depth is not None:
            output["hap"] = round(output["plumb_cut_length"] - bird_depth, 1)

        print(f"  OK (forsøk {attempt})")
        return {
            "input": case,
            "status": "ok",
            "output": output,
            "expected": compute_expected(case),
            "raw_output": result.output,
        }

    print(f"  FEILET etter {MAX_RETRIES} forsøk")
    return {
        "input": case,
        "status": "error",
        "error": f"failed after {MAX_RETRIES} attempts",
    }


def main():
    client = BrowserUse(api_key=os.environ["BROWSER_USE_API_KEY"])

    total = len(TEST_CASES)
    print("Blocklayer full verifisering")
    print(f"{total} cases med varierende run, vinkel, utstikk, depth, seat")
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
            "test_block": "full_verification",
            "results": results,
        }, f, indent=2, ensure_ascii=False)

    # Analyse
    print("\n" + "=" * 60)
    print("SAMMENLIGNING — vår kalkulator vs Blocklayer")
    print("=" * 60)

    compare_fields = [
        "rafter_top_length", "total_rafter_length", "plumb_cut_setback",
        "birdsmouth_depth", "hap", "rise", "total_rafter_run", "total_fall",
        "overhang_along_rafter",
    ]

    all_ok = True
    for r in results:
        if r["status"] != "ok":
            print(f"\n  Case {r['input']}: FEILET")
            all_ok = False
            continue

        case = r["input"]
        print(f"\n  run={case['run']}, angle={case['angle']}°, "
              f"overhang={case['overhang']}, depth={case['depth']}, "
              f"seat={case['seat']}")

        expected = r["expected"]
        output = r["output"]

        for field in compare_fields:
            exp = expected.get(field)
            got = output.get(field)
            if exp is None or got is None:
                status = "null"
                all_ok = False
            else:
                diff = abs(got - exp)
                if diff <= 1:
                    status = "OK"
                else:
                    status = f"AVVIK {got - exp:+.0f}"
                    all_ok = False
            print(f"    {field:<24} forventet={exp or 'n/a':>8}  "
                  f"blocklayer={got or 'n/a':>8}  {status}")

    print(f"\n{'Alt OK (maks ±1mm)' if all_ok else 'Avvik funnet — se over'}")
    print(f"Lagret: {output_path}\n")


if __name__ == "__main__":
    main()
