import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "BaseBonfire",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base],
  ssr: true,
});

export const BONFIRE_CORE_ADDRESS =
  (process.env.NEXT_PUBLIC_BONFIRE_CORE_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const BONFIRE_ASH_ADDRESS =
  (process.env.NEXT_PUBLIC_BONFIRE_ASH_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const EMOTION_COLORS: Record<number, string> = {
  0: "#FFD700",
  1: "#4169E1",
  2: "#DC143C",
  3: "#800080",
  4: "#FF8C00",
};

export const EMOTION_NAMES: Record<number, string> = {
  0: "Happy 😊",
  1: "Sad 😢",
  2: "Angry 😠",
  3: "Fear 😨",
  4: "Mixed 🌀",
};

export const CONTENT_TYPE_POINTS: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 10,
  5: 5,
};
