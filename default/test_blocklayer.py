"""
Test: Hent sperredata fra Blocklayer rafter-kalkulator via Browser Use cloud API.
"""

import os
import time

from dotenv import load_dotenv
from browser_use_sdk import BrowserUse

load_dotenv()

TASK = """
Go to https://www.blocklayer.com/roof/rafter

Fill in these values in the calculator:
- Set "Run" to 3000
- Set "Roof Angle" to 30
- Set "Overhang" to 300
- Leave all other fields at their default values

If there is a "Calculate" button, click it.

Then read and report these results exactly as shown on the page:
- Rise
- Rafter Length
- Total Length (if available)
- Plumb Cut Angle (if available)

Report each value with its label and unit.
"""


def main():
    client = BrowserUse(api_key=os.environ["BROWSER_USE_API_KEY"])

    print("Starter oppgave mot Blocklayer...")
    task = client.tasks.create_task(
        task=TASK,
        start_url="https://www.blocklayer.com/roof/rafter",
        llm="browser-use-2.0",
    )
    task_id = task.id
    print(f"Task opprettet: {task_id}")

    while True:
        status = client.tasks.get_task_status(task_id)
        print(f"  Status: {status.status}")
        if status.status in ("finished", "failed", "stopped"):
            break
        time.sleep(3)

    result = client.tasks.get_task(task_id)

    print("\n" + "=" * 50)
    print("BLOCKLAYER RAFTER — RESULTATER")
    print("=" * 50)
    print(result.output if hasattr(result, "output") else result)
    print("=" * 50)


if __name__ == "__main__":
    main()
