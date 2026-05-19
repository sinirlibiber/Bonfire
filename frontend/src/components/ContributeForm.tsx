"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useContribute, useIgnite } from "@/hooks/useBonfire";
import { uploadTextToIPFS, uploadFileToIPFS, detectEmotion, stringToBytes32 } from "@/lib/ipfs";

const CONTENT_TYPES = [
  { id: 0, label: "Word",     emoji: "📝", placeholder: "A single word..." },
  { id: 1, label: "Sentence", emoji: "💬", placeholder: "A sentence..." },
  { id: 2, label: "Emoji",    emoji: "😊", placeholder: "One emoji..." },
  { id: 3, label: "Feeling",  emoji: "🫀", placeholder: "How you feel right now..." },
  { id: 4, label: "Audio",    emoji: "🎵", placeholder: null },
  { id: 5, label: "Image",    emoji: "🖼️", placeholder: null },
];

const EMOTIONS = [
  { id: 0, label: "Happy",  color: "#FFD700", emoji: "😊" },
  { id: 1, label: "Sad",    color: "#4169E1", emoji: "😢" },
  { id: 2, label: "Angry",  color: "#DC143C", emoji: "😠" },
  { id: 3, label: "Fear",   color: "#800080", emoji: "😨" },
  { id: 4, label: "Mixed",  color: "#FF8C00", emoji: "🌀" },
];

interface Props {
  isBurning: boolean;
  onSuccess?: () => void;
}

export default function ContributeForm({ isBurning, onSuccess }: Props) {
  const { isConnected } = useAccount();
  const { contribute, isPending: isContributing } = useContribute();
  const { ignite, isPending: isIgniting } = useIgnite();

  const [contentType, setContentType] = useState(0);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [emotion, setEmotion] = useState(4);
  const [autoEmotion, setAutoEmotion] = useState(true);
  const [status, setStatus] = useState<"idle" | "uploading" | "txn" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isFileType = contentType === 4 || contentType === 5;

  const handleTextChange = (val: string) => {
    setText(val);
    if (autoEmotion && val.length > 3) {
      setEmotion(detectEmotion(val));
    }
  };

  const handleIgnite = async () => {
    if (!isConnected) return;
    try {
      setStatus("txn");
      await ignite();
      setStatus("done");
      onSuccess?.();
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.shortMessage || e.message || "Transaction failed");
    }
  };

  const handleSubmit = async () => {
    if (!isConnected) return;
    try {
      setStatus("uploading");

      let result;
      if (isFileType && file) {
        result = await uploadFileToIPFS(file);
      } else if (text.trim()) {
        result = await uploadTextToIPFS(text.trim(), `bonfire-${contentType}`);
      } else {
        setStatus("error");
        setErrorMsg("Please add some content first");
        return;
      }

      setStatus("txn");
      await contribute(result.cidBytes32, contentType, emotion);

      setStatus("done");
      setText("");
      setFile(null);
      onSuccess?.();

      setTimeout(() => setStatus("idle"), 3000);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.shortMessage || e.message || "Something went wrong");
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Connect your wallet to throw something into the fire</p>
      </div>
    );
  }

  if (!isBurning) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm mb-4">The fire is out. Light it again.</p>
        <button
          onClick={handleIgnite}
          disabled={isIgniting || status === "txn"}
          className="px-6 py-3 rounded-xl font-semibold text-black bg-[#FFD700] hover:bg-[#FFC200] disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {isIgniting || status === "txn" ? "⏳ Igniting..." : "🔥 Light the Bonfire"}
        </button>
        {status === "done" && (
          <p className="text-green-400 text-sm mt-3">✅ Fire ignited! You are the Reigniter.</p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm mt-3">❌ {errorMsg}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Content type selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setContentType(ct.id)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              contentType === ct.id
                ? "bg-[#FF4500] text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {ct.emoji} {ct.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      {isFileType ? (
        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
          <input
            type="file"
            accept={contentType === 4 ? "audio/*" : "image/*"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <p className="text-gray-400 text-sm">
              {file ? `✅ ${file.name}` : `Drop a ${contentType === 4 ? "audio" : "image"} file here`}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {contentType === 4 ? "+10 seconds to the fire" : "+5 seconds to the fire"}
            </p>
          </label>
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={CONTENT_TYPES[contentType].placeholder || ""}
          maxLength={contentType === 0 ? 30 : 280}
          rows={contentType === 1 || contentType === 3 ? 3 : 2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#FF4500]/50"
        />
      )}

      {/* Emotion picker */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500">Mood</span>
          {!isFileType && (
            <button
              onClick={() => setAutoEmotion((v) => !v)}
              className={`text-xs px-2 py-0.5 rounded ${autoEmotion ? "bg-[#FF4500]/20 text-[#FF4500]" : "bg-white/5 text-gray-500"}`}
            >
              {autoEmotion ? "auto" : "manual"}
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {EMOTIONS.map((em) => (
            <button
              key={em.id}
              onClick={() => { setEmotion(em.id); setAutoEmotion(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                emotion === em.id
                  ? "ring-2 ring-offset-1 ring-offset-black scale-105"
                  : "bg-white/5 hover:bg-white/10"
              }`}
              style={emotion === em.id ? { outline: `2px solid ${em.color}`, backgroundColor: em.color + "22" } : {}}
            >
              {em.emoji} {em.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === "uploading" || status === "txn" || isContributing}
        className="w-full py-3 rounded-xl font-semibold text-white bg-[#FF4500] hover:bg-[#E03D00] disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {status === "uploading" ? "📡 Uploading to IPFS..." :
         status === "txn" ? "⏳ Sending to chain..." :
         status === "done" ? "✅ Thrown into the fire!" :
         "🔥 Throw into the Bonfire"}
      </button>

      {status === "error" && (
        <p className="text-red-400 text-xs text-center">❌ {errorMsg}</p>
      )}
    </div>
  );
}
