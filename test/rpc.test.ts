import { describe, it, expect, vi } from "vitest";
import { zksEstimateFee, ethEstimateGas, ethGasPrice, zksGetL1GasPrice } from "../src/rpc.js";

describe("rpc functions", () => {
  it("zksEstimateFee sends correct JSON-RPC method", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: {
            gasLimit: "0x1e8480",
            gasPerPubdataLimit: "0xc350",
            maxFeePerGas: "0x5f5e100",
            maxPriorityFeePerGas: "0x0",
          },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await zksEstimateFee("https://rpc.test", {
      from: "0x00",
      to: "0x01",
    });

    expect(result.gasLimit).toBe("0x1e8480");
    expect(result.gasPerPubdataLimit).toBe("0xc350");
    expect(mockFetch).toHaveBeenCalledOnce();

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.method).toBe("zks_estimateFee");

    vi.unstubAllGlobals();
  });

  it("ethEstimateGas sends correct JSON-RPC method", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: "0x5208" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await ethEstimateGas("https://rpc.test", {
      from: "0x00",
      to: "0x01",
    });

    expect(result).toBe("0x5208");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.method).toBe("eth_estimateGas");

    vi.unstubAllGlobals();
  });

  it("ethGasPrice sends correct JSON-RPC method", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: "0x3b9aca00" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await ethGasPrice("https://rpc.test");
    expect(result).toBe("0x3b9aca00");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.method).toBe("eth_gasPrice");

    vi.unstubAllGlobals();
  });

  it("zksGetL1GasPrice sends correct JSON-RPC method", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: "0x12a05f200" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await zksGetL1GasPrice("https://rpc.test");
    expect(result).toBe("0x12a05f200");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.method).toBe("zks_getL1GasPrice");

    vi.unstubAllGlobals();
  });

  it("throws on HTTP error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      ethGasPrice("https://rpc.test")
    ).rejects.toThrow("RPC request failed: 500 Internal Server Error");

    vi.unstubAllGlobals();
  });

  it("throws on RPC error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          error: { code: -32000, message: "execution reverted" },
        }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      ethEstimateGas("https://rpc.test", { to: "0x00" })
    ).rejects.toThrow("RPC error: execution reverted (code -32000)");

    vi.unstubAllGlobals();
  });

  it("throws on missing result", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      ethGasPrice("https://rpc.test")
    ).rejects.toThrow("RPC returned no result");

    vi.unstubAllGlobals();
  });
});
