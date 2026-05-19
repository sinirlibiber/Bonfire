"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        <span className="font-bold text-lg tracking-tight">BaseBonfire</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/history" className="text-sm text-gray-400 hover:text-white transition-colors">
          Ash Archive
        </Link>
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="avatar"
        />
      </div>
    </nav>
  );
}
