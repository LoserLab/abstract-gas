import { describe, it, expect } from "vitest";
import { buildPresetTx, allPresets, presetDescriptions } from "../src/presets.js";
import type { PresetType } from "../src/types.js";

describe("allPresets", () => {
  it("has 6 presets", () => {
    expect(allPresets).toHaveLength(6);
  });

  it("includes expected presets", () => {
    expect(allPresets).toContain("transfer");
    expect(allPresets).toContain("erc20-transfer");
    expect(allPresets).toContain("erc20-approve");
    expect(allPresets).toContain("swap");
    expect(allPresets).toContain("nft-mint");
    expect(allPresets).toContain("deploy");
  });
});

describe("presetDescriptions", () => {
  it("has a description for every preset", () => {
    for (const preset of allPresets) {
      expect(presetDescriptions[preset]).toBeDefined();
      expect(typeof presetDescriptions[preset]).toBe("string");
      expect(presetDescriptions[preset].length).toBeGreaterThan(0);
    }
  });
});

describe("buildPresetTx", () => {
  it("builds a transfer tx", () => {
    const tx = buildPresetTx("transfer");
    expect(tx.to).toBeDefined();
    expect(tx.value).toBe("0x1");
    expect(tx.data).toBeUndefined();
  });

  it("builds an erc20-transfer tx with correct selector", () => {
    const tx = buildPresetTx("erc20-transfer");
    expect(tx.data).toBeDefined();
    expect(tx.data!.startsWith("0xa9059cbb")).toBe(true);
    // selector (8) + address (64) + uint256 (64) = 136 chars + 0x prefix
    expect(tx.data!.length).toBe(2 + 8 + 64 + 64);
  });

  it("builds an erc20-approve tx with correct selector", () => {
    const tx = buildPresetTx("erc20-approve");
    expect(tx.data).toBeDefined();
    expect(tx.data!.startsWith("0x095ea7b3")).toBe(true);
    expect(tx.data!.length).toBe(2 + 8 + 64 + 64);
  });

  it("builds a swap tx with calldata", () => {
    const tx = buildPresetTx("swap");
    expect(tx.data).toBeDefined();
    expect(tx.data!.startsWith("0x38ed1739")).toBe(true);
  });

  it("builds an nft-mint tx", () => {
    const tx = buildPresetTx("nft-mint");
    expect(tx.data).toBeDefined();
    expect(tx.data!.startsWith("0xa0712d68")).toBe(true);
  });

  it("builds a deploy tx targeting zero address", () => {
    const tx = buildPresetTx("deploy");
    expect(tx.to).toBe("0x0000000000000000000000000000000000000000");
    expect(tx.data).toBeDefined();
    expect(tx.data!.startsWith("0x60806040")).toBe(true);
  });

  it("all presets return a valid tx with from field", () => {
    for (const preset of allPresets) {
      const tx = buildPresetTx(preset);
      expect(tx.from).toBeDefined();
      expect(tx.to).toBeDefined();
    }
  });
});
