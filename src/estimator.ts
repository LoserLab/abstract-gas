import type {
  TransactionCall,
  GasEstimate,
  GasComparison,
  RpcConfig,
} from "./types.js";
import {
  zksEstimateFee,
  ethEstimateGas,
  ethGasPrice,
  zksGetL1GasPrice,
} from "./rpc.js";

/** Format wei to ETH string with 8 decimal places */
export function weiToEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  if (eth === 0) return "0.00000000";
  if (eth < 0.00000001) return "<0.00000001";
  return eth.toFixed(8);
}

/** Format ETH to USD string */
export function ethToUsd(ethStr: string, ethPrice: number): string {
  const eth = parseFloat(ethStr);
  if (eth === 0) return "$0.00";
  const usd = eth * ethPrice;
  if (usd < 0.01) return "<$0.01";
  return `$${usd.toFixed(2)}`;
}

/** Format gwei */
export function weiToGwei(wei: bigint): string {
  const gwei = Number(wei) / 1e9;
  if (gwei < 0.001) return "<0.001";
  return gwei.toFixed(3);
}

/** Estimate gas for a transaction on Abstract */
export async function estimateGas(
  tx: TransactionCall,
  config: RpcConfig
): Promise<GasEstimate> {
  const [feeResult, l1GasPriceHex] = await Promise.all([
    zksEstimateFee(config.abstractRpc, tx),
    zksGetL1GasPrice(config.abstractRpc).catch(() => null),
  ]);

  const gasLimit = BigInt(feeResult.gasLimit);
  const gasPerPubdataLimit = BigInt(feeResult.gasPerPubdataLimit);
  const maxFeePerGas = BigInt(feeResult.maxFeePerGas);
  const l1GasPrice = l1GasPriceHex ? BigInt(l1GasPriceHex) : null;

  const totalCostWei = gasLimit * maxFeePerGas;
  const estimatedCostEth = weiToEth(totalCostWei);
  const estimatedCostUsd = config.ethPriceUsd
    ? ethToUsd(estimatedCostEth, config.ethPriceUsd)
    : null;

  return {
    gasLimit,
    gasPerPubdataLimit,
    maxFeePerGas,
    estimatedCostEth,
    estimatedCostUsd,
    l1GasPrice,
    l2GasPrice: maxFeePerGas,
  };
}

/** Compare gas costs between Abstract and Ethereum */
export async function compareGas(
  tx: TransactionCall,
  config: RpcConfig
): Promise<GasComparison> {
  const abstractEstimate = await estimateGas(tx, config);

  let ethereum: GasComparison["ethereum"] = null;
  let savings: GasComparison["savings"] = null;

  if (config.ethereumRpc) {
    try {
      const [ethGasHex, ethPriceHex] = await Promise.all([
        ethEstimateGas(config.ethereumRpc, tx),
        ethGasPrice(config.ethereumRpc),
      ]);

      const gasEstimate = BigInt(ethGasHex);
      const gasPrice = BigInt(ethPriceHex);
      const totalCostWei = gasEstimate * gasPrice;
      const estimatedCostEth = weiToEth(totalCostWei);
      const estimatedCostUsd = config.ethPriceUsd
        ? ethToUsd(estimatedCostEth, config.ethPriceUsd)
        : null;

      ethereum = { gasEstimate, gasPrice, estimatedCostEth, estimatedCostUsd };

      const abstractCost = abstractEstimate.gasLimit * abstractEstimate.maxFeePerGas;
      const ethCost = gasEstimate * gasPrice;

      if (ethCost > 0n) {
        const saved = ethCost - abstractCost;
        const pct = (Number(saved) / Number(ethCost)) * 100;
        savings = {
          percentage: `${pct.toFixed(1)}%`,
          absoluteEth: weiToEth(saved > 0n ? saved : -saved),
        };
      }
    } catch {
      // Ethereum estimation failed (e.g. contract doesn't exist on L1)
    }
  }

  return { abstract: abstractEstimate, ethereum, savings };
}
