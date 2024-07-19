import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { bech32 } from "bech32";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const roundToSignificantDigits = (
  value: number,
  significantDigits: number
): number => {
  if (value === 0) return 0;
  const digits =
    -Math.floor(Math.log10(Math.abs(value))) + (significantDigits - 1);
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const roundNumber = (value: number): string => {
  let roundedValue: number;
  if (value >= 1) {
    roundedValue = parseFloat(value.toFixed(1));
  } else {
    roundedValue = roundToSignificantDigits(value, 2);
  }

  return roundedValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 20,
    useGrouping: false,
  });
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const hexToBech32Address = (address: string, prefix: string): string => {
  if (!address || !address.startsWith("0x")) {
    throw new Error("Invalid hex address");
  }
  const data = Buffer.from(address.substr(2), "hex");
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
};
