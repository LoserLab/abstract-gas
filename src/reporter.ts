import type { GasEstimate, GasComparison, PresetType } from "./types.js";
import { weiToGwei } from "./estimator.js";
import { presetDescriptions } from "./presets.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";

function formatRow(label: string, value: string, color = WHITE): string {
  return `  ${DIM}${label.padEnd(24)}${RESET}${color}${value}${RESET}`;
}

/** Format a single Abstract gas estimate */
export function formatEstimate(est: GasEstimate, label?: string): string {
  const lines: string[] = [];

  if (label) {
    lines.push(`${BOLD}${GREEN}${label}${RESET}`);
    lines.push("");
  }

  lines.push(`${BOLD}${WHITE}  Abstract (ZKsync L2)${RESET}`);
  lines.push(formatRow("Gas limit", est.gasLimit.toLocaleString(), CYAN));
  lines.push(formatRow("Gas per pubdata", est.gasPerPubdataLimit.toLocaleString(), CYAN));
  lines.push(formatRow("Max fee per gas", `${weiToGwei(est.maxFeePerGas)} gwei`, CYAN));
  if (est.l1GasPrice !== null) {
    lines.push(formatRow("L1 gas price", `${weiToGwei(est.l1GasPrice)} gwei`, DIM));
  }
  lines.push(formatRow("L2 gas price", `${weiToGwei(est.l2GasPrice)} gwei`, DIM));
  lines.push("");
  lines.push(formatRow("Estimated cost", `${est.estimatedCostEth} ETH`, GREEN));
  if (est.estimatedCostUsd) {
    lines.push(formatRow("", est.estimatedCostUsd, GREEN));
  }

  return lines.join("\n");
}

/** Format a full gas comparison */
export function formatComparison(cmp: GasComparison, label?: string): string {
  const lines: string[] = [];

  if (label) {
    lines.push(`${BOLD}${GREEN}${label}${RESET}`);
    lines.push("");
  }

  // Abstract section
  lines.push(`${BOLD}${WHITE}  Abstract (ZKsync L2)${RESET}`);
  lines.push(formatRow("Gas limit", cmp.abstract.gasLimit.toLocaleString(), CYAN));
  lines.push(formatRow("Gas per pubdata", cmp.abstract.gasPerPubdataLimit.toLocaleString(), CYAN));
  lines.push(formatRow("Max fee per gas", `${weiToGwei(cmp.abstract.maxFeePerGas)} gwei`, CYAN));
  lines.push(formatRow("Estimated cost", `${cmp.abstract.estimatedCostEth} ETH`, GREEN));
  if (cmp.abstract.estimatedCostUsd) {
    lines.push(formatRow("", cmp.abstract.estimatedCostUsd, GREEN));
  }

  // Ethereum section
  if (cmp.ethereum) {
    lines.push("");
    lines.push(`${BOLD}${WHITE}  Ethereum L1${RESET}`);
    lines.push(formatRow("Gas estimate", cmp.ethereum.gasEstimate.toLocaleString(), CYAN));
    lines.push(formatRow("Gas price", `${weiToGwei(cmp.ethereum.gasPrice)} gwei`, CYAN));
    lines.push(formatRow("Estimated cost", `${cmp.ethereum.estimatedCostEth} ETH`, YELLOW));
    if (cmp.ethereum.estimatedCostUsd) {
      lines.push(formatRow("", cmp.ethereum.estimatedCostUsd, YELLOW));
    }
  }

  // Savings section
  if (cmp.savings) {
    lines.push("");
    const pct = parseFloat(cmp.savings.percentage);
    if (pct > 0) {
      lines.push(`  ${BOLD}${GREEN}↓ ${cmp.savings.percentage} cheaper on Abstract${RESET} ${DIM}(${cmp.savings.absoluteEth} ETH saved)${RESET}`);
    } else {
      lines.push(`  ${BOLD}${YELLOW}↑ ${cmp.savings.percentage.replace("-", "")} more expensive on Abstract${RESET}`);
    }
  }

  return lines.join("\n");
}

/** Format preset comparison table */
export function formatPresetTable(
  results: Array<{ preset: PresetType; comparison: GasComparison }>
): string {
  const lines: string[] = [];

  lines.push(`${BOLD}${GREEN}abstract-gas${RESET} ${DIM}v0.1.0${RESET}`);
  lines.push("");

  for (const { preset, comparison } of results) {
    const desc = presetDescriptions[preset];
    lines.push(formatComparison(comparison, desc));
    lines.push("");
    lines.push(`${DIM}${"─".repeat(50)}${RESET}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** Format results as JSON */
export function formatJson(
  results: Array<{ preset: PresetType; comparison: GasComparison }>
): string {
  const serializable = results.map(({ preset, comparison }) => ({
    preset,
    description: presetDescriptions[preset],
    abstract: {
      gasLimit: comparison.abstract.gasLimit.toString(),
      gasPerPubdataLimit: comparison.abstract.gasPerPubdataLimit.toString(),
      maxFeePerGas: comparison.abstract.maxFeePerGas.toString(),
      estimatedCostEth: comparison.abstract.estimatedCostEth,
      estimatedCostUsd: comparison.abstract.estimatedCostUsd,
      l1GasPrice: comparison.abstract.l1GasPrice?.toString() ?? null,
      l2GasPrice: comparison.abstract.l2GasPrice.toString(),
    },
    ethereum: comparison.ethereum
      ? {
          gasEstimate: comparison.ethereum.gasEstimate.toString(),
          gasPrice: comparison.ethereum.gasPrice.toString(),
          estimatedCostEth: comparison.ethereum.estimatedCostEth,
          estimatedCostUsd: comparison.ethereum.estimatedCostUsd,
        }
      : null,
    savings: comparison.savings,
  }));

  return JSON.stringify(serializable, null, 2);
}
