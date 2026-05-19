"use client";
import { useReadContract, useWriteContract, useWatchContractEvent, usePublicClient } from "wagmi";
import { BONFIRE_CORE_ADDRESS, BONFIRE_ASH_ADDRESS, EMOTION_COLORS } from "@/lib/config";
import { BONFIRE_CORE_ABI, BONFIRE_ASH_ABI } from "@/lib/abis";
import { useState, useEffect, useCallback } from "react";

export type BonfireState = 0 | 1; // 0 = DORMANT, 1 = BURNING

export interface BonfireInfo {
  state: BonfireState;
  bonfireId: bigint;
  lastContrib: bigint;
  burnDuration: bigint;
  dominantEmotion: number;
  lastContent: string;
  color: string;
  isLoading: boolean;
  secondsUntilExtinguish: number;
}

export function useBonfireInfo() {
  const [secondsUntilExtinguish, setSecondsUntilExtinguish] = useState(0);

  const { data, isLoading, refetch } = useReadContract({
    address: BONFIRE_CORE_ADDRESS,
    abi: BONFIRE_CORE_ABI,
    functionName: "getBonfireInfo",
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    if (!data) return;
    const [, , lastContrib, , ,] = data;
    const TIMEOUT = 300; // 5 minutes

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const elapsed = now - Number(lastContrib);
      const remaining = Math.max(0, TIMEOUT - elapsed);
      setSecondsUntilExtinguish(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) {
    return {
      state: 0 as BonfireState,
      bonfireId: 0n,
      lastContrib: 0n,
      burnDuration: 0n,
      dominantEmotion: 4,
      lastContent: "",
      color: EMOTION_COLORS[4],
      isLoading,
      secondsUntilExtinguish: 0,
      refetch,
    };
  }

  const [state, bonfireId, lastContrib, burnDuration, dominantEmotion, lastContent] = data;

  return {
    state: state as BonfireState,
    bonfireId,
    lastContrib,
    burnDuration,
    dominantEmotion,
    lastContent,
    color: EMOTION_COLORS[dominantEmotion] || EMOTION_COLORS[4],
    isLoading,
    secondsUntilExtinguish,
    refetch,
  };
}

export function useContribute() {
  const { writeContractAsync, isPending } = useWriteContract();

  const contribute = useCallback(
    async (cid: `0x${string}`, contentType: number, emotionScore: number) => {
      return writeContractAsync({
        address: BONFIRE_CORE_ADDRESS,
        abi: BONFIRE_CORE_ABI,
        functionName: "contribute",
        args: [cid, contentType, emotionScore],
      });
    },
    [writeContractAsync]
  );

  return { contribute, isPending };
}

export function useIgnite() {
  const { writeContractAsync, isPending } = useWriteContract();

  const ignite = useCallback(async () => {
    return writeContractAsync({
      address: BONFIRE_CORE_ADDRESS,
      abi: BONFIRE_CORE_ABI,
      functionName: "ignite",
    });
  }, [writeContractAsync]);

  return { ignite, isPending };
}

export function useAshRecord(tokenId: bigint) {
  const { data, isLoading } = useReadContract({
    address: BONFIRE_ASH_ADDRESS,
    abi: BONFIRE_ASH_ABI,
    functionName: "getAshRecord",
    args: [tokenId],
    query: { enabled: tokenId > 0n },
  });

  return { record: data, isLoading };
}

export function useTotalAshCount() {
  const { data } = useReadContract({
    address: BONFIRE_ASH_ADDRESS,
    abi: BONFIRE_ASH_ABI,
    functionName: "nextTokenId",
    query: { refetchInterval: 10000 },
  });
  return data ?? 0n;
}
