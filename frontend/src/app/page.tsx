"use client";
import { useBonfireInfo } from "@/hooks/useBonfire";
import BonfireCanvas from "@/components/BonfireCanvas";
import ContributeForm from "@/components/ContributeForm";
import Link from "next/link";

export default function Home() {
  const info = useBonfireInfo();

  const isBurning = info.state === 1;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Bonfire ID badge */}
        <div className="text-center">
          {info.bonfireId > 0n && (
            <span className="inline-block text-xs text-gray-600 font-mono border border-white/5 px-3 py-1 rounded-full">
              Bonfire #{info.bonfireId.toString()}
            </span>
          )}
        </div>

        {/* The fire */}
        <div className="flex justify-center">
          <BonfireCanvas
            color={info.color}
            dominantEmotion={info.dominantEmotion}
            burnDuration={info.burnDuration}
            isBurning={isBurning}
            secondsUntilExtinguish={info.secondsUntilExtinguish}
          />
        </div>

        {/* Contribute card */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4 text-center">
            {isBurning ? "Throw something into the fire" : "Light the bonfire"}
          </h2>
          <ContributeForm isBurning={isBurning} onSuccess={() => info.refetch()} />
        </div>

        {/* Points guide */}
        {isBurning && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Word / Emoji", pts: "+1s" },
              { label: "Image", pts: "+5s" },
              { label: "Audio", pts: "+10s" },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-mono font-bold" style={{ color: info.color }}>{item.pts}</p>
              </div>
            ))}
          </div>
        )}

        {/* Link to archive */}
        <div className="text-center">
          <Link href="/history" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            View the Ash Archive →
          </Link>
        </div>
      </div>
    </div>
  );
}
