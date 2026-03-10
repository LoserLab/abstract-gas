import type { TransactionCall, PresetType } from "./types.js";

/** Zero address for estimation targets */
const ZERO = "0x0000000000000000000000000000000000000000";
const DEAD = "0x000000000000000000000000000000000000dEaD";

/** ERC-20 transfer(address,uint256) selector */
const ERC20_TRANSFER = "0xa9059cbb";
/** ERC-20 approve(address,uint256) selector */
const ERC20_APPROVE = "0x095ea7b3";

/** Pad address to 32 bytes */
function padAddress(addr: string): string {
  return addr.replace("0x", "").padStart(64, "0");
}

/** Encode uint256 */
function padUint256(val: string): string {
  return BigInt(val).toString(16).padStart(64, "0");
}

/** Preset transaction descriptions */
export const presetDescriptions: Record<PresetType, string> = {
  transfer: "ETH transfer (simple send)",
  "erc20-transfer": "ERC-20 token transfer",
  "erc20-approve": "ERC-20 token approval",
  swap: "DEX swap (Uniswap-style, ~150k gas)",
  "nft-mint": "NFT mint (ERC-721, ~100k gas)",
  deploy: "Contract deployment (~500k gas)",
};

/**
 * Build a representative TransactionCall for a preset type.
 * These use dead addresses since we only need gas estimation.
 */
export function buildPresetTx(preset: PresetType): TransactionCall {
  const from = ZERO;

  switch (preset) {
    case "transfer":
      return { from, to: DEAD, value: "0x1" };

    case "erc20-transfer":
      return {
        from,
        to: DEAD,
        data:
          ERC20_TRANSFER +
          padAddress(DEAD) +
          padUint256("1000000"),
      };

    case "erc20-approve":
      return {
        from,
        to: DEAD,
        data:
          ERC20_APPROVE +
          padAddress(DEAD) +
          padUint256("115792089237316195423570985008687907853269984665640564039457584007913129639935"),
      };

    case "swap":
      // Simulate a swap with ~150k gas worth of calldata
      return {
        from,
        to: DEAD,
        data: "0x38ed1739" + "00".repeat(192),
      };

    case "nft-mint":
      // Simulate an NFT mint
      return {
        from,
        to: DEAD,
        data: "0xa0712d68" + padUint256("1"),
      };

    case "deploy":
      // Simulate a contract deployment with ~1KB bytecode
      return {
        from,
        to: ZERO,
        data: "0x60806040" + "00".repeat(1024),
      };
  }
}

/** All preset types */
export const allPresets: PresetType[] = [
  "transfer",
  "erc20-transfer",
  "erc20-approve",
  "swap",
  "nft-mint",
  "deploy",
];
