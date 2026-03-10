import { describe, it, expect } from "vitest";
import { formatEstimate, formatComparison, formatJson } from "../src/reporter.js";
import type { GasEstimate, GasComparison } from "../src/types.js";

const mockEstimate: GasEstimate = {
  gasLimit: 2000000n,
  gasPerPubdataLimit: 50000n,
  maxFeePerGas: 250000000n,
  estimatedCostEth: "0.00050000",
  estimatedCostUsd: "$1.00",
  l1GasPrice: 5000000000n,
  l2GasPrice: 250000000n,
};

const mockComparison: GasComparison = {
  abstract: mockEstimate,
  ethereum: {
    gasEstimate: 21000n,
    gasPrice: 30000000000n,
    estimatedCostEth: "0.00063000",
    estimatedCostUsd: "$1.26",
  },
  savings: {
    percentage: "20.6%",
    absoluteEth: "0.00013000",
  },
};

describe("formatEstimate", () => {
  it("includes gas limit", () => {
    const output = formatEstimate(mockEstimate);
    expect(output).toContain("2,000,000");
  });

  it("includes gas per pubdata", () => {
    const output = formatEstimate(mockEstimate);
    expect(output).toContain("50,000");
  });

  it("includes estimated cost", () => {
    const output = formatEstimate(mockEstimate);
    expect(output).toContain("0.00050000 ETH");
  });

  it("includes USD cost when available", () => {
    const output = formatEstimate(mockEstimate);
    expect(output).toContain("$1.00");
  });

  it("includes label when provided", () => {
    const output = formatEstimate(mockEstimate, "Test Label");
    expect(output).toContain("Test Label");
  });
});

describe("formatComparison", () => {
  it("includes Abstract section", () => {
    const output = formatComparison(mockComparison);
    expect(output).toContain("Abstract");
    expect(output).toContain("2,000,000");
  });

  it("includes Ethereum section", () => {
    const output = formatComparison(mockComparison);
    expect(output).toContain("Ethereum L1");
    expect(output).toContain("21,000");
  });

  it("includes savings", () => {
    const output = formatComparison(mockComparison);
    expect(output).toContain("20.6%");
    expect(output).toContain("cheaper on Abstract");
  });

  it("handles no ethereum comparison", () => {
    const cmp: GasComparison = {
      abstract: mockEstimate,
      ethereum: null,
      savings: null,
    };
    const output = formatComparison(cmp);
    expect(output).toContain("Abstract");
    expect(output).not.toContain("Ethereum L1");
  });
});

describe("formatJson", () => {
  it("returns valid JSON", () => {
    const output = formatJson([
      { preset: "transfer", comparison: mockComparison },
    ]);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].preset).toBe("transfer");
  });

  it("serializes bigints as strings", () => {
    const output = formatJson([
      { preset: "transfer", comparison: mockComparison },
    ]);
    const parsed = JSON.parse(output);
    expect(parsed[0].abstract.gasLimit).toBe("2000000");
    expect(parsed[0].ethereum.gasEstimate).toBe("21000");
  });

  it("includes savings", () => {
    const output = formatJson([
      { preset: "transfer", comparison: mockComparison },
    ]);
    const parsed = JSON.parse(output);
    expect(parsed[0].savings.percentage).toBe("20.6%");
  });

  it("handles null ethereum", () => {
    const cmp: GasComparison = {
      abstract: mockEstimate,
      ethereum: null,
      savings: null,
    };
    const output = formatJson([{ preset: "transfer", comparison: cmp }]);
    const parsed = JSON.parse(output);
    expect(parsed[0].ethereum).toBeNull();
  });
});
