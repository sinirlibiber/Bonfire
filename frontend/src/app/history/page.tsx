"use client";
import { useTotalAshCount, useAshRecord } from "@/hooks/useBonfire";
import { EMOTION_COLORS, EMOTION_NAMES } from "@/lib/config";
import Link from "next/link";

function AshCard({ tokenId }: { tokenId: bigint }) {
  const { record, isLoading } = useAshRecord(tokenId);

  if (isLoading) {
    return (
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    );
  }

  if (!record) return null;

  const color = EMOTION_COLORS[record.dominantEmotion] || "#FF8C00";
  const emotion = EMOTION_NAMES[record.dominantEmotion] || "Mixed";
  const burnSecs = Number(record.totalBurnDuration);
  const hours = Math.floor(burnSecs / 3600);
  const mins = Math.floor((burnSecs % 3600) / 60);
  const secs = burnSecs % 60;
  const durationStr = hours > 0
    ? `${hours}h ${mins}m`
    : mins > 0
    ? `${mins}m ${secs}s`
    : `${secs}s`;

  const dateStr = new Date(Number(record.extinguishedAt) * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link href={`/ash/${tokenId}`}>
      <div
        className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all hover:scale-[1.01] cursor-pointer"
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs text-gray-600 font-mono">Ash #{tokenId.toString()}</span>
            <p className="text-sm font-medium mt-0.5">Bonfire #{record.bonfireId.toString()}</p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: color + "22", border: `1px solid ${color}44` }}
          >
            {emotion.split(" ")[1]}
          </div>
        </div>

        <div className="flex gap-4 text-xs text-gray-500">
          <span>🔥 {durationStr}</span>
          <span>💬 {record.totalContributions.toString()} contributions</span>
          <span>{dateStr}</span>
        </div>

        <div className="mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color + "22", color }}
          >
            {emotion}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HistoryPage() {
  const total = useTotalAshCount();
  const tokenIds = Array.from({ length: Number(total) }, (_, i) => BigInt(total) - BigInt(i));

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Ash Archive</h1>
          <p className="text-gray-500 text-sm mt-1">
            Every bonfire that ever burned — frozen forever on-chain.
          </p>
          <p className="text-xs text-gray-700 mt-1 font-mono">{total.toString()} total</p>
        </div>

        {tokenIds.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-4">🌑</p>
            <p>No ashes yet. The first fire hasn't burned.</p>
            <Link href="/" className="text-[#FF4500] text-sm mt-4 inline-block hover:underline">
              Light the first bonfire →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tokenIds.map((id) => (
              <AshCard key={id.toString()} tokenId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
