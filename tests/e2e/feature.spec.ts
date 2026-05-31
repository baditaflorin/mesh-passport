import { expect, test } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  name: string;
};
const storagePrefix = pkg.name;

test("A stamps B; A's passport shows 1/1 → 100%", async ({ browser, baseURL }) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", { storagePrefix });
  try {
    await a.getByPlaceholder("your name").fill("alice");
    await b.getByPlaceholder("your name").fill("bob");

    await b.locator(".mesh-qrx-payload summary").click();
    const bp = (await b.locator(".mesh-qrx-payload code").textContent()) ?? "";
    await a.getByPlaceholder("or paste a payload (URL or mesh://)").fill(bp);
    await a.getByRole("button", { name: "use", exact: true }).click();

    await expect(a.locator(".pp-complete")).toBeVisible();
    await expect(a.locator(".pp-grid")).toContainText("bob");

    // --- Load-bearing cross-peer assertion (the OPPOSITE peer). ---
    // The check above only proves the scanner (A) updated its own screen. The
    // advertised "completionist passport book" is a *shared* artifact: when A
    // stamps B, the Edge pushed to the "stamps" Y.Array and A's name in the
    // "names" Y.Map must propagate to B. Assert on B that A's stamp shows up in
    // the shared completionist leaderboard — this fails if the stamp never
    // crosses the mesh (e.g. a write to local state instead of the Yjs doc).
    await expect(b.locator(".pp-board")).toContainText("alice");
    const aliceRow = b.locator(".pp-board li").filter({ hasText: "alice" });
    await expect(aliceRow).toContainText("1 stamps");

    // And the reverse direction: B can now scan A back and the cross-peer
    // tally on A reflects B's stamp too (A appears with 1 stamp on B's board,
    // B appears with 1 on A's board) — proving sync is bidirectional, not a
    // one-way mirror of the scanner's local state.
    await a.locator(".mesh-qrx-payload summary").click();
    const ap = (await a.locator(".mesh-qrx-payload code").textContent()) ?? "";
    await b.getByPlaceholder("or paste a payload (URL or mesh://)").fill(ap);
    await b.getByRole("button", { name: "use", exact: true }).click();

    await expect(b.locator(".pp-complete")).toBeVisible();
    await expect(a.locator(".pp-board")).toContainText("bob");
    const bobRow = a.locator(".pp-board li").filter({ hasText: "bob" });
    await expect(bobRow).toContainText("1 stamps");
  } finally {
    await cleanup();
  }
});
