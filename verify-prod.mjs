import { chromium } from "playwright";
const BASE = "https://va-hub-three.vercel.app";
const shots = "C:\\Users\\User\\AppData\\Local\\Temp\\claude\\d--projects-VA-workspace\\278809f8-7f97-43dc-9e07-eb3cb3423eda\\scratchpad\\shots-prod";
import { mkdirSync } from "fs";
mkdirSync(shots, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(err.message));

async function shot(name) {
  await page.screenshot({ path: `${shots}\\${name}.png`, fullPage: true });
  console.log("shot:", name);
}

try {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await shot("01-login");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForSelector("text=Good morning");
  await shot("02-dashboard");

  await page.goto(`${BASE}/design-engine`, { waitUntil: "networkidle" });
  await page.fill('input[name="q"]', "real estate open house flyer");
  await page.click('button:has-text("Match template")');
  await page.waitForURL("**/design-engine?q=**");
  await page.waitForSelector("text=Open House");
  await shot("03-design-engine");

  await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
  const portalLink = await page.getAttribute('a[href^="/p/"]', "href");
  await shot("04-portal-index");

  if (portalLink) {
    await page.goto(`${BASE}${portalLink}`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Welcome back");
    await shot("05-public-portal");
  }

  console.log("DONE");
} catch (e) {
  console.error("VERIFY_ERROR:", e.message);
  await shot("ERROR-state");
} finally {
  console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
  await browser.close();
}
