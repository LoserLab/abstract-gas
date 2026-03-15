/** Raw response from zks_estimateFee RPC */
export interface ZksEstimateFeeResult {
  gasLimit: string;
  gasPerPubdataLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

/** Transaction call object for estimation */
export interface TransactionCall {
  from?: string;
  to: string;
  data?: string;
  value?: string;
}

/** Breakdown of gas estimate for Abstract */
export interface GasEstimate {
  /** Total gas limit (in ergs) */
  gasLimit: bigint;
  /** Gas per pubdata byte limit */
  gasPerPubdataLimit: bigint;
  /** Max fee per gas (wei) */
  maxFeePerGas: bigint;
  /** Estimated total cost in ETH */
  estimatedCostEth: string;
  /** Estimated total cost in USD (if ethPrice provided) */
  estimatedCostUsd: string | null;
  /** L1 gas price (wei) */
  l1GasPrice: bigint | null;
  /** L2 gas price / base fee (wei) */
  l2GasPrice: bigint;
}

/** Comparison between Abstract and Ethereum gas costs */
export interface GasComparison {
  abstract: GasEstimate;
  ethereum: {
    gasEstimate: bigint;
    gasPrice: bigint;
    estimatedCostEth: string;
    estimatedCostUsd: string | null;
  } | null;
  savings: {
    percentage: string;
    absoluteEth: string;
  } | null;
}

/** RPC configuration */
export interface RpcConfig {
  abstractRpc: string;
  ethereumRpc?: string;
  ethPriceUsd?: number;
}

/** Preset transaction types for quick estimation */
export type PresetType =
  | "transfer"
  | "erc20-transfer"
  | "erc20-approve"
  | "swap"
  | "nft-mint"
  | "deploy";
