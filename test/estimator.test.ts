import { describe, it, expect } from "vitest";
import { weiToEth, weiToGwei, ethToUsd } from "../src/estimator.js";

describe("weiToEth", () => {
  it("converts 0 wei", () => {
    expect(weiToEth(0n)).toBe("0.00000000");
  });

  it("converts 1 ETH", () => {
    expect(weiToEth(1000000000000000000n)).toBe("1.00000000");
  });

  it("converts 0.001 ETH", () => {
    expect(weiToEth(1000000000000000n)).toBe("0.00100000");
  });

  it("converts very small amounts", () => {
    expect(weiToEth(1n)).toBe("<0.00000001");
  });

  it("converts 0.5 ETH", () => {
    expect(weiToEth(500000000000000000n)).toBe("0.50000000");
  });
});

describe("weiToGwei", () => {
  it("converts 1 gwei", () => {
    expect(weiToGwei(1000000000n)).toBe("1.000");
  });

  it("converts 0.25 gwei", () => {
    expect(weiToGwei(250000000n)).toBe("0.250");
  });

  it("converts very small amounts", () => {
    expect(weiToGwei(1n)).toBe("<0.001");
  });

  it("converts 30 gwei", () => {
    expect(weiToGwei(30000000000n)).toBe("30.000");
  });
});

describe("ethToUsd", () => {
  it("converts ETH to USD", () => {
    expect(ethToUsd("1.00000000", 2000)).toBe("$2000.00");
  });

  it("handles zero", () => {
    expect(ethToUsd("0.00000000", 2000)).toBe("$0.00");
  });

  it("handles very small amounts", () => {
    expect(ethToUsd("0.00000100", 2000)).toBe("<$0.01");
  });

  it("handles decimal amounts", () => {
    expect(ethToUsd("0.50000000", 2000)).toBe("$1000.00");
  });
});
