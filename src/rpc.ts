import type { ZksEstimateFeeResult, TransactionCall } from "./types.js";

/** JSON-RPC request helper */
async function rpcCall<T>(
  url: string,
  method: string,
  params: unknown[]
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!res.ok) {
    throw new Error(`RPC request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };

  if (json.error) {
    throw new Error(`RPC error: ${json.error.message} (code ${json.error.code})`);
  }

  if (json.result === undefined) {
    throw new Error("RPC returned no result");
  }

  return json.result;
}

export async function zksEstimateFee(
  rpcUrl: string,
  tx: TransactionCall
): Promise<ZksEstimateFeeResult> {
  return rpcCall<ZksEstimateFeeResult>(rpcUrl, "zks_estimateFee", [tx]);
}

export async function ethEstimateGas(
  rpcUrl: string,
  tx: TransactionCall
): Promise<string> {
  return rpcCall<string>(rpcUrl, "eth_estimateGas", [tx]);
}

export async function ethGasPrice(rpcUrl: string): Promise<string> {
  return rpcCall<string>(rpcUrl, "eth_gasPrice", []);
}

export async function zksGetL1GasPrice(rpcUrl: string): Promise<string> {
  return rpcCall<string>(rpcUrl, "zks_getL1GasPrice", []);
}
