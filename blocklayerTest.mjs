// Automatisk testing mot Blocklayer gable stud calculator
// Kjør: npx playwright test --config=false blocklayerTest.mjs
// Eller: node blocklayerTest.mjs (via playwright som library)

import { chromium } from 'playwright';

const TEST_CASES = [
  {
    navn: 'Grunncase 30° single centre',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '1',
      spacing: '600',
      startWith: 'Single Stud',
      startIn: 'Centre',
      alignSheets: false,
    },
  },
  {
    navn: 'Near side — sjekk om lengde endres',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '1',
      spacing: '600',
      startWith: 'Single Stud',
      startIn: 'Near Side',
      alignSheets: false,
    },
  },
  {
    navn: 'Far side — sjekk om lengde endres',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '1',
      spacing: '600',
      startWith: 'Single Stud',
      startIn: 'Far Side',
      alignSheets: false,
    },
  },
  {
    navn: '2 topplemmer — lengde -48mm',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '2',
      spacing: '600',
      startWith: 'Single Stud',
      startIn: 'Centre',
      alignSheets: false,
    },
  },
  {
    navn: 'Align Sheets PÅ',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '1',
      spacing: '600',
      startWith: 'Single Stud',
      startIn: 'Centre',
      alignSheets: true,
    },
  },
  {
    navn: 'Double Stud start',
    inputs: {
      angle: '30',
      studThick: '48',
      startHeight: '2400',
      plateThick: '48',
      topPlates: '1',
      spacing: '600',
      startWith: 'Double Stud',
      startIn: 'Centre',
      alignSheets: false,
    },
  },
];

async function run() {
  const browser = await chromium.launch({ headless: false });
  const results = [];

  for (const tc of TEST_CASES) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('https://www.blocklayer.com/gable-studs', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Switch to Metric if not already
      const metricBtn = page.locator('text=Metric').first();
      if (await metricBtn.isVisible()) {
        await metricBtn.click();
        await page.waitForTimeout(500);
      }

      // Fill angle
      await clearAndFill(page, 'angle', tc.inputs.angle);

      // Fill stud thickness
      await clearAndFill(page, 'studThick', tc.inputs.studThick);

      // Fill start height
      await clearAndFill(page, 'startHeight', tc.inputs.startHeight);

      // Fill plate thickness
      await clearAndFill(page, 'plateThick', tc.inputs.plateThick);

      // Fill spacing / centres
      await clearAndFill(page, 'spacing', tc.inputs.spacing);

      // Top plates
      await selectByText(page, 'topPlates', tc.inputs.topPlates);

      // Start With
      await selectByText(page, 'startWith', tc.inputs.startWith);

      // Start In
      await selectByText(page, 'startIn', tc.inputs.startIn);

      // Align Sheets
      await setCheckbox(page, 'alignSheets', tc.inputs.alignSheets);

      // Trigger calculation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1500);

      // Extract results - try multiple strategies
      const data = await page.evaluate(() => {
        const result = { stendere: [], runLevel: [], runAngle: [], rawText: '' };

        // Strategy 1: Look for table rows with stud data
        const tables = document.querySelectorAll('table');
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
              const values = Array.from(cells).map(c => c.textContent.trim());
              // Check if first cell is a number (stud #)
              if (/^\d+$/.test(values[0])) {
                result.stendere.push({
                  nr: parseInt(values[0]),
                  texts: values,
                });
              }
            }
          }
        }

        // Strategy 2: Look for any element with stud length data
        const allText = document.body.innerText;
        // Find sections with "Stud Length" or "Running Points"
        const lines = allText.split('\n').filter(l => l.trim());
        const relevantLines = lines.filter(l =>
          /stud|running|length|level|angle|centres/i.test(l)
          || /^\d+\s+\d/.test(l.trim())
        );
        result.rawText = relevantLines.join('\n');

        // Strategy 3: Look for specific output divs/spans
        const outputEls = document.querySelectorAll(
          '[id*="stud"], [id*="result"], [id*="output"], [id*="run"], [class*="result"], [class*="output"]'
        );
        result.outputIds = Array.from(outputEls).map(el => ({
          id: el.id,
          className: el.className,
          text: el.textContent.substring(0, 200),
        }));

        // Strategy 4: canvas/svg text
        const canvasEls = document.querySelectorAll('canvas');
        result.canvasCount = canvasEls.length;

        return result;
      });

      results.push({
        navn: tc.navn,
        inputs: tc.inputs,
        data: data,
      });

    } catch (err) {
      results.push({
        navn: tc.navn,
        error: err.message,
      });
    }

    await context.close();
  }

  await browser.close();

  // Output
  console.log(JSON.stringify(results, null, 2));
}

async function clearAndFill(page, fieldHint, value) {
  // Try multiple selectors
  const selectors = [
    `input[name*="${fieldHint}" i]`,
    `input[id*="${fieldHint}" i]`,
    `input[placeholder*="${fieldHint}" i]`,
  ];

  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click({ clickCount: 3 });
      await el.fill(value);
      return;
    }
  }

  // Fallback: try to find by nearby label text
  const labelMap = {
    angle: ['Angle', 'angle', '°'],
    studThick: ['Stud Thick', 'Stud Width', 'Thickness'],
    startHeight: ['Start Height', 'Height', 'Wall Height'],
    plateThick: ['Plate Thick', 'Plate'],
    spacing: ['Spacing', 'Centres', 'Centers', 'O/C'],
  };

  const labels = labelMap[fieldHint] || [fieldHint];
  for (const label of labels) {
    try {
      const input = page.locator(`text=${label}`).locator('..').locator('input').first();
      if (await input.isVisible().catch(() => false)) {
        await input.click({ clickCount: 3 });
        await input.fill(value);
        return;
      }
    } catch (e) { /* continue */ }
  }

  // Last resort: find all inputs and try by index
  console.error(`Could not find field: ${fieldHint}`);
}

async function selectByText(page, fieldHint, value) {
  const selectors = [
    `select[name*="${fieldHint}" i]`,
    `select[id*="${fieldHint}" i]`,
  ];

  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.selectOption({ label: value });
      return;
    }
  }
}

async function setCheckbox(page, fieldHint, checked) {
  const selectors = [
    `input[type="checkbox"][name*="${fieldHint}" i]`,
    `input[type="checkbox"][id*="${fieldHint}" i]`,
  ];

  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      if (checked) await el.check();
      else await el.uncheck();
      return;
    }
  }
}

run().catch(console.error);
