"use client";
import { useAshRecord } from "@/hooks/useBonfire";
import { EMOTION_COLORS, EMOTION_NAMES } from "@/lib/config";
import Link from "next/link";
import { use } from "react";

export default function AshDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tokenId = BigInt(id);
  const { record, isLoading } = useAshRecord(tokenId);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">Loading ash record...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Ash #{id} not found</p>
          <Link href="/history" className="text-[#FF4500] text-sm mt-3 inline-block">← Back to Archive</Link>
        </div>
      </div>
    );
  }

  const color = EMOTION_COLORS[record.dominantEmotion] || "#FF8C00";
  const emotion = EMOTION_NAMES[record.dominantEmotion] || "Mixed";
  const burnSecs = Number(record.totalBurnDuration);
  const hours = Math.floor(burnSecs / 3600);
  const mins = Math.floor((burnSecs % 3600) / 60);
  const secs = burnSecs % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m ${secs}s` : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  const dateStr = new Date(Number(record.extinguishedAt) * 1000).toLocaleString();

  const topContributors = record.topContributors.filter(
    (a) => a !== "0x0000000000000000000000000000000000000000"
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/history" className="text-gray-600 text-sm hover:text-gray-400 transition-colors">
          ← Ash Archive
        </Link>

        {/* Frozen flame visualization */}
        <div className="mt-6 flex justify-center">
          <div className="relative">
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                border: `1px solid ${color}44`,
              }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: color + "22" }}
              >
                {emotion.split(" ")[1]}
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-600 whitespace-nowrap">
              Ash Fragment #{id}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 space-y-3">
          <h1 className="text-xl font-bold">Bonfire #{record.bonfireId.toString()}</h1>
          <p className="text-sm" style={{ color }}>{emotion} — The final mood</p>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "Burned For", value: durationStr },
              { label: "Contributions", value: record.totalContributions.toString() },
              { label: "Extinguished", value: dateStr },
              { label: "Reigniter", value: record.reigniterAddress === "0x0000000000000000000000000000000000000000"
                ? "—"
                : record.reigniterAddress.slice(0, 6) + "..." + record.reigniterAddress.slice(-4) },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-sm font-medium font-mono mt-1 break-all">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top contributors */}
        {topContributors.length > 0 && (
          <div className="mt-6 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">🏆 Top Contributors</h3>
            <div className="space-y-2">
              {topContributors.map((addr, i) => (
                <div key={addr} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 font-mono text-xs w-5">{i + 1}.</span>
                  <span className="font-mono text-gray-300">
                    {addr.slice(0, 8)}...{addr.slice(-6)}
                  </span>
                  {i === 0 && <span style={{ color }} className="text-xs">👑</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/">
            <button className="px-6 py-3 rounded-xl font-semibold text-black bg-[#FFD700] hover:bg-[#FFC200] transition-all hover:scale-105">
              🔥 Go to Current Bonfire
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
